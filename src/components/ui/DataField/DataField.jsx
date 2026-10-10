import { forwardRef } from 'react';
import TextField from '../TextField/TextField';

/**
 * Campo de fecha. Es un TextField con type="date", así comparte label,
 * borde, foco y mensajes de error con el resto de formularios.
 *
 * `value` usa formato ISO 'YYYY-MM-DD'; el navegador lo muestra en el
 * formato local (14/09/2026). Acepta las mismas props que TextField,
 * incluidas `min` y `max`.
 */
const DateField = forwardRef(function DateField(props, ref) {
  return <TextField ref={ref} {...props} type="date" />;
});

export default DateField;
