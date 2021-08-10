import React, { CSSProperties } from 'react';

const defaultRootStyle: CSSProperties = {
	fontSize: 12,
	display: 'flex',
	zIndex: 999
};

const defaultLinkStyle: CSSProperties = {
	textDecoration: 'none'
};

interface Props {
	rootStyleOverride?: CSSProperties,
	linkStyleOverride?: CSSProperties
}

export const Copyright: React.FunctionComponent<Props> = ({rootStyleOverride, linkStyleOverride}) => {
	const rootStyle = {...defaultRootStyle, ...rootStyleOverride};
	const linkStyle = {...defaultLinkStyle, ...linkStyleOverride};

	return (
		<span style={rootStyle}>
			<a href="https://www.icos-ri.eu/" target="_blank" style={linkStyle}>© ICOS RI</a>
			<span>&nbsp;-&nbsp;</span>
			<a rel="license" href="http://creativecommons.org/licenses/by/4.0/" target="_blank">
				<img alt="Creative Commons License" src="//static.icos-cp.eu/images/cc4by_small.png" />
			</a>
		</span>
	);
};
