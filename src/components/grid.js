import React from 'react';

const Grid = ({ numColumns, gap, rowGap, height, children }) => {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '1fr '.repeat(numColumns),
				gridColumnGap: gap,
				gridRowGap: rowGap,
				marginTop: '5px',
				height: height || null,
				transition: '.5s'
			}}
		>
			{children}
		</div>
	);
};
Grid.defaultProps = {
	gap: '15px',
	rowGap: '15px'
}

const Cell = ({ span, children }) => {
	return (
		<div
			style={{
				gridColumn: `span ${span}`
			}}
		>
			{children}
		</div>
	);
};

export default Grid;
export { Cell };