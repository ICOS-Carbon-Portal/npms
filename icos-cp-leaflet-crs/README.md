# ICOS Carbon Portal Leaflet CRS

## Description
Leaflet CRS definitions for projected tile grids, backed by proj4. Ships as ES modules and expects
Leaflet 1.9 as a peer dependency.

Currently provides `crs3006` for Lantmäteriet's SWEREF99 TM (EPSG:3006) tile grid, along with
`lm3006MaxZoom` and `swedenLatLngBounds`. Use `createCrs` to define other grids.

## Installation
`npm install @icos-cp/leaflet-crs`

## Usage
```js
import * as L from 'leaflet';
import {crs3006, lm3006MaxZoom, swedenLatLngBounds} from '@icos-cp/leaflet-crs';

const map = L.map('map', {crs: crs3006, maxZoom: lm3006MaxZoom, maxBounds: swedenLatLngBounds.pad(0.1)});
map.fitBounds(swedenLatLngBounds);
```
