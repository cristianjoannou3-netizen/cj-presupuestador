const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const CATALOGO = `
LÍNEA Herrero:
  17 – Marco alto tránsito
  22 – Tablilla unión marco 75
  30 – Perfil central vidrio repartido
  31 – Perfil lateral vidrio repartido
  32 – Perfil lateral 32
  37 – Doble contacto puerta 25mm
  39 – Marco puerta 36
  40 – Doble contacto puerta 36mm
  44 – Zócalo alto puerta corrediza
  45 – Tapa junta
  46 – Revestimiento acanalado
  47 – Revestimiento tubular
  48 – Marco puerta placa 45
  53 – Parante lateral reforzado 90°
  54 – Parante central reforzado
  58 – Marco corrediza 4 guías postigón
  100 – Marco corrediza liviano
  101 – Marco de corrediza
  102 – Cabezal y zócalo de hoja
  103 – Parante lateral hoja corrediza
  104 – Parante central hoja corrediza
  105 – Hoja mosquitero
  107 – Paño fijo herrero
  108 – Contravidrio herrero
  161 – Marco aireador
  178 – Parante postigón chico
  185 – Columna acople recto
  186 – Columna acople curvo
  188B – Marco chico postigón
  332 – Escuadra intermedia
  417 – Tablilla curva postigón
  418 – Tablilla recta postigón
  599 – Travesaño mosquitero
  691 – Marco tres guías
  MPR25 – Marco postigón
  PP25 – Parante postigón 25
  PP36 – Parante puerta 36
  TP36 – Travesaño puerta 36
  822 – Batinete mosquitero
  973 – Marco paño fijo
  987 – Columna acople 45°
  1573 – Hoja mosquitero fijo
  1690 – Guía vent.corrediza escuadra
  1920 – Guía cortina enrollar
  830 – Hoja mampara baño
  1345 – Cabezal cubre bañera
  1349 – Inferior mampara
  1350 – Jamba cubre bañera

LÍNEA Módena:
  5989 – Varilla accionamiento vent.abrir
  6200 – Umbral y dintel marco corrediza
  6201 – Jambas marco ventana/puerta corrediza
  6203 – Parante lateral hoja vidrio simple
  6204 – Zócalo y cabezal hoja vidrio simple
  6205 – Premarco
  6206 – Tapa premarco
  6207 – Parante central hoja vidrio simple
  6208 – Parante central con tirador
  6209 – Zócalo alto hoja vidrio simple
  6210 – Marco ventana abrir cámara
  6211 – Hoja ventana abrir cámara
  6212 – Contravidrio 36mm
  6213 – Perfil de acople
  6214 – Jambas y cabezal hoja puerta rebatir
  6215 – Hoja ventana abrir DC/banderola
  6216 – Marco vent.abrir DC/banderola/rebatir
  6217 – Contravidrio 29mm
  6218 – Travesaño hoja puerta rebatir
  6219 – Zócalo hoja puerta rebatir
  6220 – Contravidrio exterior puerta rebatir
  6221 – Travesaño hoja puerta rebatir alt.
  6222 – Travesaño ancho paño fijo
  6224 – Encuentro central vent.abrir 2 hojas DC
  6225 – Contravidrio recto 22mm
  6226 – Contravidrio recto 15mm
  6227 – Hoja ventiluz
  6228 – Tope mosquitero
  6229 – Paño fijo curvo
  6230 – Contravidrio curvo 29mm
  6231 – Contravidrio curvo 15mm
  6232 – Contravidrio curvo 22mm
  6233 – Contravidrio curvo 8mm
  6234 – Hoja curva vent.abrir cámara
  6235 – Hoja curva vent.abrir DC/banderola
  6236 – Hoja curva ventiluz
  6237 – Contravidrio exterior curvo rebatir
  6238 – Contravidrio recto 8mm
  6239 – Contravidrio recto 8mm alt.
  6240 – Umbral/dintel marco 3 guías
  6241 – Jambas marco 3 guías
  6243 – Guía cortina común
  6244 – Guía cortina barrio
  6245 – Tapa cinta
  6246 – Encuentro central 4 hojas
  6248 – Parante lateral hoja DVH
  6249 – Zócalo y cabezal hoja DVH
  6250 – Parante central hoja DVH
  6251 – Parante central tirador DVH
  6252 – Zócalo alto hoja DVH puerta
  6253 – Travesaño hoja DVH puerta
  6254 – Bisagra tapa cinta
  6255 – Bastidor mosquitero
  6256 – Travesaño mosquitero
  6257 – Contravidrio curvo 36mm
  6258 – Hoja vent.proyectante recta
  6259 – Marco vent.proyectante
  6260 – Hoja vent.proyectante curva
  6261 – Columna acople reforzada
  6262 – Perfil acople 90°
  6263 – Zócalo alto paño fijo
  6264 – Travesaño paño fijo curvo
  6265 – Perfil acople 135°
  6277 – Tablilla regulable postigón
  6278 – Compensador corto postigón
  6279 – Compensador largo postigón
  6906 – Marco perimetral corrediza 45°
  6907 – Complemento parante central 45°
  6908 – Hoja vidrio simple 45°
  6909 – Hoja DVH 45°

LÍNEA Premium:
  4045 – Contravidrio recto 37mm
  4046 – Contravidrio recto 19mm
  4051 – Contravidrio recto 37mm clip
  4052 – Contravidrio recto 19mm clip
  4054 – Hoja recta ventana abrir
  4059 – Marco paño fijo/ventana rebatir
  4060 – Travesaño paño fijo
  4067 – Perfil de acople
  7063 – Contramarco recto
  7144 – Mosquitero corredizo
  7215 – Umbral/dintel marco corrediza 2 guías
  7216 – Parante central hoja 90° DVH
  7217 – Zócalo y cabezal hoja 90° DVH
  7218 – Zócalo alto hoja 90° DVH
  7219 – Solapa cruce hojas
  7220 – Jamba marco corrediza 2 guías
  7221 – Parante lateral hoja 90° DVH
  7222 – Hoja corrediza 45° DVH
  7223 – Encuentro central puerta rebatir
  7233 – Acople 180°
  7243 – Umbral/dintel adicional
  7244 – Jamba adicional lisa
  7245 – Jamba adicional con U
  7247 – Encuentro central 4 hojas
  7261 – Guía inferior corrediza
  7263 – Umbral/dintel 3 guías
  7264 – Jamba 3 guías
  7266 – Guía mosquitero
  7335 – Zócalo puerta rebatir
  7336 – Travesaño puerta rebatir
  7340 – Hoja puerta rebatir

LÍNEA A30 New:
  5965 – Encuentro central corrediza 4 hojas
  6034 – Parante lateral corrediza
  6035 – Parante central corrediza
  6036 – Jambas de marco
  6037 – Umbral y dintel de marco
  6038 – Mosquitero reforzado
  6039 – Tope mosquitero
  6040 – Marco puerta rebatir coplanar
  6041 – Hoja puerta de rebatir
  6042 – Marco puerta de rebatir
  6043 – Zócalo puerta de rebatir
  6044 – Encuentro central puerta rebatir
  6045 – Contravidrio recto vidrio simple
  6046 – Contravidrio recto DVH
  6047 – Contravidrio curvo vidrio simple
  6048 – Contravidrio curvo DVH
  6049 – Contravidrio recto ext. puerta rebatir
  6050 – Contravidrio curvo ext. puerta rebatir
  6051 – Marco ventana de abrir
  6052 – Hoja curva ventana abrir
  6053 – Encuentro central ventana abrir
  6054 – Hoja recta ventana abrir
  6055 – Marco paño fijo y ventana abrir
  6056 – Hoja curva ventana desplazable
  6057 – Marco ventana desplazable
  6058 – Hoja recta ventana desplazable
  6059 – Marco recto paño fijo y ventana abrir
  6060 – Travesaño paño fijo
  6061 – Zócalo y cabezal ventana corrediza
  6062 – Zócalo alto puerta corrediza
  6064 – Guía cortina común
  6065 – Guía cortina barrio
  6066 – Premarco
  6067 – Acople 60mm marco 3 guías
  6068 – Perfil de acople
  6069 – Acople 90 grados
  6071 – Parante lateral corrediza DVH
  6072 – Parante central corrediza DVH
  6073 – Zócalo y cabezal corrediza DVH
  6074 – Zócalo alto corrediza DVH
  6078 – Perfil acople reforzado
  6079 – Premarco corrediza 3 hojas
  6080 – Jamba marco corrediza 3 hojas
  6081 – Umbral y dintel corrediza 3 hojas
  6082 – Parante central tercer hoja DVH
  6083 – Parante central tercer hoja
  6206 – Tapa premarco
  6508 – Adaptador corte 90°

LÍNEA Estructural:
  NL-800 – Ángulo 9,5×9,5
  NL-012 – Ángulo 12×12
  NL-015 – Ángulo 15×15
  NL-020 – Ángulo 20×20
  NL-809 – Ángulo 20×20 e2
  NL-027 – Ángulo 25×25 e3
  NL-811 – Ángulo 25,4×25,4
  NL-032 – Ángulo 32×32
  NL-039 – Ángulo 38×38
  NL-820 – Ángulo 38×38 e3
  NL-036 – Ángulo 38×38 e4
  NL-051 – Ángulo 50×50
  NL-050 – Ángulo 50×50 e3
  NL-823 – Ángulo 50,8×50,8
  NL-824 – Ángulo 50,8×50,8 e3
  NL-830 – Ángulo 50,8×50,8 e4
  NL-033 – Perfil L 30×15
  NL-037 – Perfil L 38×25
  NL-040 – Perfil L 40×20
  NL-855 – Perfil L 50,8×25,4
  NL-080 – Perfil L 80×20
  NL-100 – Perfil L 100×20
  NU-750 – Perfil U 11×19
  NU-082 – Perfil U 12,7×12,7
  NU-018 – Perfil U 12,7×18
  NU-317 – Perfil U 20×20
  NU-067 – Perfil U 34×17
  NU-340 – Perfil U 60×11,5
  TC-101 – Tubo cuadrado 12,7
  TC-015 – Tubo cuadrado 15
  TC-020 – Tubo cuadrado 20
  TC-025 – Tubo cuadrado 25
  TC-030 – Tubo cuadrado 30
  TC-038 – Tubo cuadrado 38
  TC-045 – Tubo cuadrado 45
  TC-049 – Tubo cuadrado 50
  TC-050 – Tubo cuadrado 50 e2
  TC-060 – Tubo cuadrado 60
  TC-601 – Tubo cuadrado 76
  TC-032 – Tubo rect. 30×12
  TC-138 – Tubo rect. 38×25
  TC-140 – Tubo rect. 40×20
  TC-150 – Tubo rect. 50×25
  TC-160 – Tubo rect. 60×20
  TC-170 – Tubo rect. 70×40
  TC-175 – Tubo rect. 75×25
  TC-177 – Tubo rect. 75×50
  TC-190 – Tubo rect. 90×40
  TC-100 – Tubo rect. 100×45
  NP-025 – Planchuela 25,4×2
  NP-032 – Planchuela 32×2
  NP-038 – Planchuela 38,1×2
  NP-051 – Planchuela 50×2,2
  NP-052 – Planchuela 50×3
  NT-901 – Perfil T 19×19
  NT-907 – Perfil T 38×38
  NT-910 – Perfil T 50,8×50,8`;

// Endpoint IA - texto
app.post('/api/analizar-texto', async (req, res) => {
  try {
    const { texto, lineaDefault, colorDefault, listaDefault } = req.body;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `Sos asistente técnico de carpintería de aluminio argentina. Devolvé SOLO un JSON array sin texto extra ni markdown.

REGLAS DE INTERPRETACIÓN DE CÓDIGOS (muy importante):

MÓDENA — los carpinteros suelen omitir el "6" inicial:
- Si ves 200, 201, 203, 204, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 224, 225, 226, 227, 228, 229, 240, 241, 243, 244, 245, 246, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 277, 278, 279 → agregale el 6 adelante (ej: 200 → 6200)

HERRERO — dos formas de abreviar:
- Números del 1 al 9 solos (1,2,3,4,5,7,8) → son 101,102,103,104,105,107,108
- Con 19 adelante: 1900→100, 1901→101, 1902→102, 1903→103, 1904→104, 1905→105, 1907→107, 1908→108

CANTIDADES — puede venir en cualquier formato:
- "x4", "4u", "4 barras", "- 4", "x 4", "(4)", o simplemente un número al lado del código

COLORES — cada ítem puede tener su propio color, detectalo en el texto:

TABLA DE COLORES (para identificar el color mencionado en el texto):
- "natural", "natu", "nat" → código 001
- "blanco", "blanc", "bco", "wh", "white" → código 002
- "negro", "negr", "ng", "black" → código 003
- "bronce", "bronc", "bce" → código 004
- "madera", "made", "mad", "wood" → código 005
- "anodizado natural", "anod nat", "an" → código 006
- "anodizado bronce claro", "anod bce cl", "abc" → código 007
- "anodizado bronce oscuro", "anod bce osc", "abo" → código 008
- "anodizado negro", "anod neg", "ang" → código 009
- "anodizado peltre", "peltre", "plt" → código 010
- "anodizado champagne", "champagne", "champ" → código 011
- "especial" → código 012
Para línea ESTRUCTURAL los mismos colores pero con códigos 013-024 (mismo orden).
Para línea PREMIUM solo: "blanco"→"blanco", "negro"→"negro".
Si no se menciona color para un ítem, usá el colorDefault.

DESCRIPCIONES — si no hay código, buscá por descripción aproximada en el catálogo:
- "marco corrediza" → buscar en la línea indicada
- "DVH" significa doble vidrio hermético
- "parante lateral/central", "zócalo", "cabezal", "jamba", "umbral", "dintel" son términos técnicos válidos

IMPORTANTE: Si la lista agrupa perfiles por color (ej: "BLANCO: 6200x4, 6201x4 / NEGRO: 103x6"), 
asigná el color correcto a cada ítem según el grupo al que pertenece.

CATÁLOGO:${CATALOGO}

Formato requerido:
[{"linea":"herrero|modena|premium|a30|estructural","codigo":"código exacto del catálogo","descripcion":"descripción","barras":1,"color":"código de color ej:002","lista":"${listaDefault}","reconocido":true,"nota":"explicá color detectado si difiere del default"}]

Defaults: linea=${lineaDefault}, color=${colorDefault}, lista=${listaDefault}.

LISTA A INTERPRETAR:
${texto}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content.map(b => b.text || '').join('');
    let parsed;
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()); }
    catch { const m = raw.match(/\[[\s\S]*\]/); parsed = JSON.parse(m[0]); }

    res.json({ ok: true, perfiles: parsed });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Endpoint IA - imagen
app.post('/api/analizar-imagen', upload.single('imagen'), async (req, res) => {
  try {
    const { lineaDefault, colorDefault, listaDefault } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ ok: false, error: 'No se recibió imagen' });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const b64 = file.buffer.toString('base64');
    const mediaType = file.mimetype;

    const prompt = `Sos asistente técnico de carpintería de aluminio argentina. Estás leyendo una lista ESCRITA A MANO por un carpintero argentino.

INSTRUCCIONES PARA LECTURA MANUSCRITA:
- La escritura puede ser poco clara, con letras y números similares entre sí
- Confusiones frecuentes: 0/6, 1/7, 3/8, 4/9, B/8, Z/2
- Extraé TODOS los códigos y cantidades visibles, aunque la escritura sea difícil

REGLAS DE INTERPRETACIÓN DE CÓDIGOS (muy importante):

MÓDENA — los carpinteros suelen omitir el "6" inicial:
- Si ves 200, 201, 203, 204, 207, 208, 209... → agregale el 6 adelante (ej: 200 → 6200, 207 → 6207)
- Si ves un número de 3 dígitos entre 200-909 y la línea default es Módena → casi seguro le falta el 6

HERRERO — dos formas de abreviar:
- Números solos del 1 al 9 (1,2,3,4,5,7,8) → son 101,102,103,104,105,107,108
- Con 19 adelante: 1900→100, 1901→101, 1902→102, 1903→103, 1904→104, 1905→105, 1907→107

CANTIDADES — puede venir en cualquier formato:
- "x4", "4u", "4 barras", "- 4", "x 4", "(4)", o un número al lado del código

COLORES — cada ítem puede tener su propio color, detectalo en el texto o imagen:

TABLA DE COLORES (para identificar el color mencionado en el texto):
- "natural", "natu", "nat" → código 001
- "blanco", "blanc", "bco", "wh", "white" → código 002
- "negro", "negr", "ng", "black" → código 003
- "bronce", "bronc", "bce" → código 004
- "madera", "made", "mad", "wood" → código 005
- "anodizado natural", "anod nat", "an" → código 006
- "anodizado bronce claro", "anod bce cl", "abc" → código 007
- "anodizado bronce oscuro", "anod bce osc", "abo" → código 008
- "anodizado negro", "anod neg", "ang" → código 009
- "anodizado peltre", "peltre", "plt" → código 010
- "anodizado champagne", "champagne", "champ" → código 011
- "especial" → código 012
Para línea ESTRUCTURAL los mismos colores pero con códigos 013-024 (mismo orden).
Para línea PREMIUM solo: "blanco"→"blanco", "negro"→"negro".
Si no se menciona color para un ítem, usá el colorDefault.

DESCRIPCIONES — si no hay código claro, interpretá por descripción:
- "marco corrediza", "parante lateral/central", "zócalo", "cabezal", "jamba", "umbral", "dintel", "DVH"

IMPORTANTE: Si la lista agrupa perfiles por color (ej: "BLANCO: 6200x4 / NEGRO: 103x6"),
asigná el color correcto a cada ítem según el grupo al que pertenece.

CATÁLOGO:${CATALOGO}

Formato requerido — devolvé SOLO este JSON array, sin texto extra:
[{"linea":"herrero|modena|premium|a30|estructural","codigo":"código exacto del catálogo","descripcion":"descripción","barras":1,"color":"código de color ej:002","lista":"${listaDefault}","reconocido":true,"nota":"explicá color detectado si difiere del default"}]

Defaults: linea=${lineaDefault}, color=${colorDefault}, lista=${listaDefault}.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
          { type: 'text', text: prompt }
        ]
      }]
    });

    const raw = message.content.map(b => b.text || '').join('');
    let parsed;
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()); }
    catch { const m = raw.match(/\[[\s\S]*\]/); parsed = JSON.parse(m[0]); }

    res.json({ ok: true, perfiles: parsed });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Endpoint generar PDF
app.post('/api/generar-pdf', async (req, res) => {
  try {
    const { cliente, items, totales, facturaMode } = req.body;
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="presupuesto-${cliente.nro}.pdf"`);
    doc.pipe(res);

    const AZUL_OSC  = '#0a1628';
    const AZUL_MED  = '#1565c0';
    const AZUL_SUAVE= '#f0f4ff';
    const GRIS      = '#5a7090';
    const W = 515;

    // ── ENCABEZADO ──
    doc.rect(0, 0, 595, 90).fill(AZUL_OSC);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('white')
       .text('CJ METALES', 40, 22);
    doc.fontSize(8).font('Helvetica').fillColor('#a8c4e8')
       .text('Carpintería de Aluminio · Perfiles · Accesorios', 40, 48);
    doc.fontSize(7.5).fillColor('#8ab0d0')
       .text('Dean Funes 779, Rosario, Santa Fe  CP 2000  ·  Tel: 341-598-5683', 40, 62);

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#90b8e0')
       .text('PRESUPUESTO', 40, 22, { align: 'right', width: W });
    doc.fontSize(20).fillColor('white')
       .text(`N° ${cliente.nro}`, 40, 35, { align: 'right', width: W });
    doc.fontSize(8.5).font('Helvetica').fillColor('#8ab0d0')
       .text(`Fecha: ${cliente.fecha}`, 40, 62, { align: 'right', width: W });

    doc.rect(0, 88, 595, 3).fill(AZUL_MED);

    // ── CLIENTE ──
    let y = 105;
    doc.rect(40, y, W, 72).fill(AZUL_SUAVE).stroke('#c5d8f0');
    const filas = [
      ['CLIENTE', cliente.nombre],
      ['TELÉFONO', cliente.tel],
      ['DIRECCIÓN / OBRA', cliente.dir],
      ['OBSERVACIONES', cliente.obs],
    ];
    filas.forEach(([lbl, val], i) => {
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GRIS)
         .text(lbl, 48, y + 5 + i*17);
      doc.fontSize(9).font('Helvetica').fillColor('#1a2d40')
         .text(val || '-', 155, y + 4 + i*17, { width: 380 });
    });
    doc.moveTo(40, y+72).lineTo(555, y+72).lineWidth(1.5).stroke(AZUL_MED);

    // ── TABLA PERFILES ──
    y += 85;
    const cols = [50, 38, 135, 48, 30, 35, 30, 38, 44, 47];
    const hdrs = ['Línea','Código','Descripción','Color','kg/m','Barras','m/b','kg tot','$/kg','Subtotal'];

    // Header tabla
    doc.rect(40, y, W, 20).fill(AZUL_MED);
    let x = 40;
    hdrs.forEach((h, i) => {
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('white')
         .text(h, x+2, y+6, { width: cols[i]-4, align: i>3 ? 'right' : 'left' });
      x += cols[i];
    });
    y += 20;

    // Filas
    items.forEach((it, idx) => {
      const bg = idx % 2 === 0 ? AZUL_SUAVE : '#f8faff';
      doc.rect(40, y, W, 16).fill(bg);
      x = 40;
      const vals = [
        it.linea, it.codigo, it.desc, it.color,
        it.pesoKgm.toFixed(3), String(it.barras), it.lb.toFixed(2),
        it.kg.toFixed(3),
        `$${Math.round(it.precio).toLocaleString('es-AR')}`,
        `$${Math.round(it.subtotal).toLocaleString('es-AR')}`
      ];
      vals.forEach((v, i) => {
        const isNum = i > 3;
        const color = i === 1 ? AZUL_MED : '#1a2d40';
        doc.fontSize(i===2?7:8).font(i===1||i===9 ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(color)
           .text(v, x+2, y+4, { width: cols[i]-4, align: isNum ? 'right' : 'left' });
        x += cols[i];
      });
      doc.moveTo(40,y+16).lineTo(555,y+16).lineWidth(0.3).stroke('#c5d8f0');
      y += 16;

      // Nueva página si hace falta
      if(y > 730){ doc.addPage(); y = 40; }
    });

    // ── TOTALES ──
    y += 8;
    const t = totales;
    const fm = n => Math.round(n).toLocaleString('es-AR');

    if(facturaMode === 'coniva'){
      [[`Base imponible`, fm(t.baseImponible)],
       [`IVA 21%`, fm(t.ivaV)]].forEach(([lbl,val]) => {
        doc.fontSize(9).font('Helvetica').fillColor(GRIS)
           .text(lbl, 350, y, { width: 155, align: 'right' });
        doc.text(`$ ${val}`, 350, y, { width: W-315, align: 'right' });
        y += 14;
      });
    } else {
      doc.fontSize(9).font('Helvetica').fillColor(GRIS)
         .text('Subtotal', 350, y, { width: 155, align: 'right' });
      doc.text(`$ ${fm(t.sub)}`, 350, y, { width: W-315, align: 'right' });
      y += 14;
    }
    if(t.mrg > 0){
      doc.fontSize(9).font('Helvetica').fillColor(GRIS)
         .text(`Margen ${t.mrg}%`, 350, y, { width: 155, align: 'right' });
      doc.text(`$ ${fm(t.mrgV)}`, 350, y, { width: W-315, align: 'right' });
      y += 14;
    }

    // Total final
    doc.rect(350, y, W-310, 22).fill(AZUL_OSC);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('white')
       .text('TOTAL', 352, y+5, { width: 150, align: 'right' });
    doc.fontSize(13).fillColor('white')
       .text(`$ ${fm(t.tot)}`, 352, y+4, { width: W-316, align: 'right' });
    y += 30;

    // ── PIE ──
    doc.moveTo(40, y+10).lineTo(555, y+10).lineWidth(1.5).stroke(AZUL_MED);
    doc.fontSize(7.5).font('Helvetica').fillColor(GRIS)
       .text('CJ Metales · Dean Funes 779, Rosario', 40, y+15)
       .text('Presupuesto válido 48 hs. Precios sujetos a cambio.', 40, y+15, { align: 'center', width: W })
       .text(`Pres. N° ${cliente.nro} · ${cliente.fecha}`, 40, y+15, { align: 'right', width: W });

    doc.end();
  } catch(e) {
    if(!res.headersSent) res.status(500).json({ ok:false, error: e.message });
  }
});

// Servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CJ Presupuestador corriendo en puerto ${PORT}`));
