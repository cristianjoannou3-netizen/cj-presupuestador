# CJ Metales – Presupuestador

Presupuestador de perfiles de aluminio con IA integrada para CJ Metales, Rosario.

## Líneas incluidas
- Herrero (6,05m)
- Módena (6,15m)  
- Premium (6,00m)
- A30 New (6,15m)
- Estructural (6,15m)

## Cómo deployar en Vercel

### 1. Subir a GitHub
1. Ir a github.com → New repository
2. Nombre: `cj-presupuestador`
3. Subir todos estos archivos

### 2. Deployar en Vercel
1. Ir a vercel.com → Add New Project
2. Importar el repositorio `cj-presupuestador`
3. En "Environment Variables" agregar:
   - Key: `ANTHROPIC_API_KEY`
   - Value: tu API key de Anthropic (sk-ant-...)
4. Click en Deploy

¡Listo! La app queda disponible en una URL tipo `cj-presupuestador.vercel.app`

## Uso local (opcional)
```bash
npm install
cp .env.example .env
# Editar .env y pegar tu API key
node server.js
# Abrir http://localhost:3000
```
