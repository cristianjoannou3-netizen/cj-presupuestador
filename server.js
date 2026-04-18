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

    const prompt = `Sos asistente de carpintería de aluminio. Devolvé SOLO un JSON array sin texto extra ni markdown.

CATÁLOGO:${CATALOGO}

Formato requerido:
[{"linea":"herrero|modena|premium|a30|estructural","codigo":"código exacto","descripcion":"descripción","barras":1,"color":"${colorDefault}","lista":"${listaDefault}","reconocido":true,"nota":""}]

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

    const prompt = `Sos asistente de carpintería de aluminio. Analizá la imagen y devolvé SOLO un JSON array sin texto extra.

CATÁLOGO:${CATALOGO}

Formato requerido:
[{"linea":"herrero|modena|premium|a30|estructural","codigo":"código exacto","descripcion":"descripción","barras":1,"color":"${colorDefault}","lista":"${listaDefault}","reconocido":true,"nota":""}]

Defaults: linea=${lineaDefault}, color=${colorDefault}, lista=${listaDefault}.
Extraé todos los códigos y cantidades visibles en la imagen.`;

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

// Servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CJ Presupuestador corriendo en puerto ${PORT}`));
