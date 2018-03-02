import * as OLmap from './OL';
import * as P from './Popup';
import * as LC from './LayerControl';

export const OL = OLmap.OL;
export const supportedSRIDs = OLmap.supportedSRIDs;
export const getViewParams = OLmap.getViewParams;
export const getSearchParams = OLmap.getSearchParams;

export const Popup = P.Popup;

export const LayerControl = LC.LayerControl;

import * as MinMax from './getProjectedMinMax';
export const getProjectedMinMax = MinMax.getProjectedMinMax;
