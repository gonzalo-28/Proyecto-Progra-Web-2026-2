// src/components/ui/Photo/Photo.jsx

import { useState } from 'react';
import ImagePlaceholder from '../ImagePlaceholder/ImagePlaceholder';
import styles from './Photo.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Imagen que llena su contenedor (object-fit: cover). Si no hay `src` o la
 * imagen no carga, muestra el ImagePlaceholder de los mockups.
 *
 * Props:
 *  - src, alt:  la imagen y su texto alternativo
 *  - ratio:     proporción CSS ('16/7', '4/3'). Sin ratio, llena al contenedor.
 *  - label:     texto del marcador cuando no hay imagen
 *  - className: clase extra
 */
export default function Photo({ src, alt = '', ratio, label, className }) {
  const [fallo, setFallo] = useState(false);

  if (!src || fallo) {
    return <ImagePlaceholder label={label} ratio={ratio} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cx(styles.root, ratio && styles.hasRatio, className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
      onError={() => setFallo(true)}
    />
  );
}
