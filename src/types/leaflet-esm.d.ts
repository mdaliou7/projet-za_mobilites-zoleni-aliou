// Leaflet fournit une version « module ES » de son code, que les types de `@types/leaflet` ne décrivent pas.
// On lui donne les mêmes types que le module `leaflet` : cela évite l'avertissement « not ESM » du build
// et permet au compilateur de n'embarquer que ce qui sert.
declare module 'leaflet/dist/leaflet-src.esm.js' {
  export * from 'leaflet';
}
