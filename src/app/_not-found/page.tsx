'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NotFoundPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404 - Página no encontrada</h1>
      {query && <p style={styles.query}>Tu búsqueda: <strong>{query}</strong></p>}
      <p style={styles.text}>
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link href="/" style={styles.link}>
        Volver al inicio
      </Link>
    </div>
  );
}

// Estilos simples inline para mantenerlo autónomo
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
    textAlign: 'center' as const,
    fontFamily: 'Arial, sans-serif',
    padding: '0 20px',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
    color: '#333',
  },
  query: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
    color: '#555',
  },
  text: {
    fontSize: '1rem',
    marginBottom: '2rem',
    color: '#666',
  },
  link: {
    textDecoration: 'none',
    color: '#0070f3',
    fontWeight: 'bold' as const,
    fontSize: '1rem',
  },
};
