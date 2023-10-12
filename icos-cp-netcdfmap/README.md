# ICOS Carbon Portal NetCDF Map package

## Description
Requires Leaflet loaded in global scope. React NetCDF Leaflet map component. It displays raster data in canvas tiles.

## Installation
`npm install icos-cp-netcdfmap`

## Properties to send
`mapOptions - OPTIONAL (JS Object) - Override options for Leaflet in componentDidMount`

`geoJson - OPTIONAL (Leaflet GeoJSON object or an array of GeoJSON objects) - Display GeoJSON layer in map, usually a country layer`

`raster - REQUIRED (BinRaster) - Raster data to show in map`

```
overlay - OPTIONAL (JS Object with [Leaflet Layer]) - Feature overlay to be displayed in map. Feature symbols must be able to be added to a Leaflet featureGroup
	Example: {label: "Station", features: [Leaflet Layer]}
```

`latLngBounds - OPTIONAL (L.latLngBounds) - If included, map will pan to center point of bounds`

`reset - OPTIONAL (Boolean) - If true, map will clear canvas, mask and overlay`

`colorMaker - REQUIRED (colorMaker) - Defines what colors the raster gets`

`renderCompleted - OPTIONAL (function) - What to do when canvas rendering is completed`

`mask - OPTIONAL (polygonMask) - Display mask showing extent`

`maskOptions - OPTIONAL (JS Object) - Override default options of mask`

## Tests
None