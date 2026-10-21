import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import Card from '../../components/ui/Card/Card';
import TextField from '../../components/ui/TextField/Textfield';
import Select from '../../components/ui/Select/Select';
import Badge from '../../components/ui/Badge/Badge';
import { getCatalogSpaces, getSpaceCatalogOptions } from '../../services/spaceCatalogService';
import styles from './PublicSpaceCatalogPage.module.css';

export default function PublicSpaceCatalogPage() {
  const spaces = useMemo(() => getCatalogSpaces().filter((space) => space.estado === 'disponible'), []);
  const options = useMemo(() => getSpaceCatalogOptions(), []);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [pavilion, setPavilion] = useState('');

  const filtered = spaces.filter((space) => {
    const query = search.trim().toLocaleLowerCase('es');
    const matchesQuery = !query || `${space.codigo} ${space.nombre} ${space.pabellon}`.toLocaleLowerCase('es').includes(query);
    return matchesQuery && (!type || space.tipo === type) && (!pavilion || space.pabellon === pavilion);
  });

  return (
    <ContentLayout screen="publicSpaces" className={styles.layout} spacing="none">
      <section className={styles.page} aria-labelledby="spaces-title">
        <header className={styles.heading}>
          <div>
            <h1 id="spaces-title">Buscar espacios</h1>
            <p>Encuentra un espacio disponible en Campus Monterrico.</p>
          </div>
          <span className={styles.count}>{filtered.length} espacios disponibles</span>
        </header>

        <Card className={styles.filters} padding="md">
          <TextField
            aria-label="Buscar espacios"
            placeholder="Buscar por nombre, código o pabellón…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            aria-label="Filtrar por tipo"
            value={type}
            onChange={(event) => setType(event.target.value)}
            options={[{ value: '', label: 'Todos los tipos' }, ...options.types.map((item) => ({ value: item.value, label: item.label }))]}
          />
          <Select
            aria-label="Filtrar por pabellón"
            value={pavilion}
            onChange={(event) => setPavilion(event.target.value)}
            options={[{ value: '', label: 'Todos los pabellones' }, ...options.pavilions.map((item) => ({ value: item.value, label: item.label }))]}
          />
        </Card>

        {filtered.length ? (
          <div className={styles.grid}>
            {filtered.map((space) => (
              <Card key={space.id} className={styles.spaceCard} padding="md">
                <div className={styles.photoThumb} aria-hidden="true"><span>{space.codigo}</span></div>
                <div className={styles.cardBody}>
                  <Badge tone="success">Disponible</Badge>
                  <h2>{space.nombre}</h2>
                  <p>{space.pabellon} · Aforo {space.capacidad}</p>
                  <div className={styles.cardFooter}>
                    <span>{space.tipoLabel}</span>
                    <Link to={`/espacios/${space.id}`}>Ver espacio <span aria-hidden="true">→</span></Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className={styles.empty} padding="lg">
            <h2>No encontramos espacios</h2>
            <p>Prueba con otro nombre o cambia los filtros.</p>
            <button type="button" onClick={() => { setSearch(''); setType(''); setPavilion(''); }}>Limpiar filtros</button>
          </Card>
        )}
      </section>
    </ContentLayout>
  );
}
