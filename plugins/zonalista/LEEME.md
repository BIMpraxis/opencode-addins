# Zonalista — plugin para opencode (versión compartible)

Versión lista para adaptar. Se han sustituido los proveedores y modelos originales por ejemplos genéricos. No contiene credenciales ni datos personales.

## Qué hace

Zonalista vigila el consumo de tokens de cada sesión de opencode y actúa en dos niveles:

1. **Aviso** — al alcanzar `warning_ratio` del umbral (por defecto el 90 %): muestra un toast y comunica al modelo que se acerca el límite.
2. **Acción** — al alcanzar el umbral: cuando la sesión queda en reposo (`session.idle`), inyecta una instrucción para preparar un *traspaso* (handoff) mediante una skill adecuada, de modo que puedas hacer `/new` y retomar el trabajo sin perder contexto.

También expone la herramienta `zonalista_set_threshold` para cambiar el umbral en caliente (solo durante la sesión actual).

## Requisitos

- [opencode](https://opencode.ai) instalado.
- [Bun](https://bun.com) solo si quieres ejecutar los tests.
- (Recomendado) una skill de traspaso/handoff. Ver el apartado «La skill de traspaso».

## Instalación

1. Copia **únicamente** estos dos archivos al nivel superior de tu directorio de plugins global:
   
   - Linux/macOS: `~/.config/opencode/plugins/`
   - Windows: `%USERPROFILE%\.config\opencode\plugins\`
   
   Archivos que deben ir en `plugins/`:
   
   - `zonalista.ts`
   - `zonalista.config.json`
   
   > No copies `zonalista.test.ts` dentro de `plugins/`. opencode auto-carga **cualquier** `*.ts`/`*.js` del nivel superior de `plugins/`, así que un archivo de tests allí dentro se intentaría cargar como plugin. Deja el test (y este `LEEME.md`) en otra carpeta y ejecútalo desde ahí.

2. Reinicia opencode. La configuración y los plugins se cargan una vez al arrancar; no hay recarga en caliente.

> Nota técnica: el autodescubrimiento usa el glob `{plugin,plugins}/*.{ts,js}` (un solo nivel, no recursivo). Por eso esta carpeta puede vivir dentro de un `plugins/` ajeno sin que sus archivos se carguen como plugins.

## Configuración (`zonalista.config.json`)

- `default_threshold`: umbral por defecto (en tokens) cuando no se puede determinar el límite de contexto del modelo.
- `warning_ratio`: fracción del umbral a la que salta el aviso previo (0.9 = 90 %).
- `rules`: cálculo automático del umbral según el límite de contexto del modelo:
  - `below_250k`: contexto < 250 k → umbral = contexto × `threshold_percent`.
  - `from_250k_to_500k`: 250 k ≤ contexto < 500 k → umbral = contexto × `threshold_percent`.
  - `above_500k`: contexto ≥ 500 k → umbral fijo = `threshold_fixed`.
- `model_thresholds` (opcional): sobrescribe el umbral para modelos concretos. Si un modelo tiene entrada aquí, se usa ese valor en lugar del cálculo por `rules`.

### Formato de la clave en `model_thresholds` (importante)

La clave es `"<providerID>:<modelConfigKey>"`, donde:

- `providerID` es el identificador del proveedor en tu `opencode.json` (por ejemplo `anthropic`, `openai`, `openrouter`, o el nombre de tu proxy o gateway privado).
- `modelConfigKey` es la **clave de configuración** del modelo, no necesariamente su campo `id`.

⚠️ Error frecuente: usar el `id` completo del modelo en lugar de la clave de configuración. Por ejemplo, si en tu config el modelo aparece así:

```json
"provider": {
  "mi-gateway": {
    "models": {
      "modelo-x": { "id": "fabricante/modelo-x" }
    }
  }
}
```

la clave correcta en `model_thresholds` es `"mi-gateway:modelo-x"` (la clave del objeto `models`), **no** `"mi-gateway:fabricante/modelo-x"` (el campo `id`). Si te equivocas, el plugin no encuentra la entrada y recurre al cálculo por `rules` o al `default_threshold`. El bloque de tests `config key format verification` documenta este comportamiento con nombres genéricos (`proveedor-a`, `router-e`, etc.).

### Cómo averiguar tus claves

1. Abre tu `opencode.json` y localiza la sección `provider`. El nombre de cada proveedor es tu `providerID`.
2. Dentro de cada proveedor, las claves del objeto `models` son tus `modelConfigKey`.
3. Construye `"<providerID>:<modelConfigKey>"` y asígnale un umbral en tokens (normalmente algo por debajo del límite de contexto real del modelo, por ejemplo el 85 %).

### Adaptar el ejemplo a tu caso

Sustituye las entradas de ejemplo por las tuyas. Las incluidas son solo ilustrativas:

```json
"model_thresholds": {
  "mi-proxy-local:mi-modelo-7b": 8000,
  "mi-proxy-local:mi-modelo-70b": 32000,
  "anthropic:claude-sonnet-4-5": 200000,
  "openai:gpt-4o": 128000,
  "openrouter:vendor/modelo-ejemplo": 120000
}
```

Si prefieres no mantener `model_thresholds`, bórralo por completo y el plugin calculará el umbral automáticamente con `rules` a partir del límite de contexto que reporte cada modelo.

## La skill de traspaso

Al alcanzar el umbral, el plugin no compacta ni inventa un formato propio: busca una **skill** cuyo nombre o descripción encaje con estas palabras clave: `traspaso`, `handoff`, `relevo`, `relevo-sesion`, `session-handoff`, `session-relevo` (lista en la función `findHandoffSkillCandidates()` de `zonalista.ts`).

- Si tu skill de traspaso se llama de otra forma, añade su nombre a esa lista.
- Si hay varias skills candidatas, el plugin te preguntará cuál usar.
- Si no existe ninguna, solo te avisará con un toast y no hará nada más.

## Tests

Con Bun instalado, dentro de la carpeta donde tengas `zonalista.test.ts`:

```
bun test
```

Los tests son autocontenidos: no importan el plugin, sino que reproducen su lógica interna (cálculo de umbral, ejecución diferida en `session.idle`, formato de la clave de modelo, independencia entre sesiones).

## Herramienta `zonalista_set_threshold`

Puedes pedir al modelo en cualquier momento, por ejemplo: «pon el umbral de Zona Lista en 500000 tokens». Usará esta herramienta. El cambio es temporal: al empezar otra sesión se restauran los valores del JSON de configuración.

## Archivos incluidos

- `zonalista.ts` — el plugin.
- `zonalista.config.json` — configuración de ejemplo (edita `model_thresholds`).
- `zonalista.test.ts` — tests (Bun). No lo dejes en `plugins/`.
- `LEEME.md` — este manual.

Se entrega tal cual, sin garantía. Adáptalo a tu infraestructura.
