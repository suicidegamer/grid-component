import React, { memo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import TableCell from './TableCell';
import TableCellCheckbox from './TableCellCheckbox';
import TableCellExpander from './TableCellExpander';
import ExpanderRow from './ExpanderRow';
import { getConditionalStyle } from './util';

const STOP_PROP_TAG = '___react-data-table-allow-propagation___';

const highlightCSS = css`
  &:hover {
    ${props => props.highlightOnHover && props.theme.rows.highlightOnHoverStyle};
  }
`;

const pointerCSS = css`
  &:hover {
    cursor: pointer;
  }
`;

const TableRowStyle = styled(motion.div)`
  display: flex;
  align-items: stretch;
  align-content: stretch;
  width: 100%;
  box-sizing: border-box;
  ${props => props.theme.rows.style};
  ${props => (props.dense && props.theme.rows.denseStyle)};
  ${props => props.striped && props.theme.rows.stripedStyle};
  ${props => props.highlightOnHover && highlightCSS};
  ${props => props.pointerOnHover && pointerCSS};
  ${props => props.selected && props.theme.rows.selectedHighlightStyle};
  ${props => props.extendedRowStyle};
`;

const TableRow = memo(({
  id,
  keyField,
  columns,
  row,
  onRowClicked,
  onDrag,
  onDragEnd,
  onRowDoubleClicked,
  selectableRows,
  expandableRows,
  striped,
  highlightOnHover,
  pointerOnHover,
  dense,
  draggable,
  expandableRowsComponent,
  defaultExpanderDisabled,
  defaultExpanded,
  expandableRowsHideExpander,
  expandOnRowClicked,
  expandOnRowDoubleClicked,
  conditionalRowStyles,
  inheritConditionalStyles,
  onRowExpandToggled,
  selected,
  selectableRowsHighlight,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const handleExpanded = useCallback(() => {
    setExpanded(!expanded);
    onRowExpandToggled(!expanded, row);
  }, [expanded, onRowExpandToggled, row]);

  const showPointer = pointerOnHover || (expandableRows && (expandOnRowClicked || expandOnRowDoubleClicked));

  const handleRowClick = useCallback(e => {
    // use event delegation allow events to propagate only when the element with data-tag ___react-data-table-allow-propagation___ is present
    if (e.target && e.target.getAttribute('data-tag') === STOP_PROP_TAG) {
      onRowClicked(row, e);

      if (!defaultExpanderDisabled && expandableRows && expandOnRowClicked) {
        handleExpanded();
      }
    }
  }, [defaultExpanderDisabled, expandOnRowClicked, expandableRows, handleExpanded, onRowClicked, row]);

  const handleRowDoubleClick = useCallback(e => {
    if (e.target && e.target.getAttribute('data-tag') === STOP_PROP_TAG) {
      onRowDoubleClicked(row, e);
      if (!defaultExpanderDisabled && expandableRows && expandOnRowDoubleClicked) {
        handleExpanded();
      }
    }
  }, [defaultExpanderDisabled, expandOnRowDoubleClicked, expandableRows, handleExpanded, onRowDoubleClicked, row]);

  const onDragEvt = useCallback(e => {
    onDrag(row, e);
  }, [draggable, row]);

  const onDragEndEvt = useCallback((e, info) => {
    onDragEnd(row, e, info);
  }, [draggable, row]);

  const extendedRowStyle = getConditionalStyle(row, conditionalRowStyles);
  const hightlightSelected = selectableRowsHighlight && selected;
  const inheritStyles = inheritConditionalStyles ? extendedRowStyle : null;

  return (
    <>
      <TableRowStyle
        id={`row-${id}`}
        role="row"
        striped={striped}
        highlightOnHover={highlightOnHover}
        pointerOnHover={!defaultExpanderDisabled && showPointer}
        dense={dense}
        drag={draggable}
        dragConstraints={
          {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          }
        }
        dragElastic={1}
        onClick={handleRowClick}
        onDoubleClick={handleRowDoubleClick}
        draggable={draggable}
        onDrag={onDragEvt}
        onDragEnd={onDragEndEvt}
        className="rdt_TableRow"
        extendedRowStyle={extendedRowStyle}
        selected={hightlightSelected}
      >
        {selectableRows && (
          <TableCellCheckbox
            name={`select-row-${row[keyField]}`}
            row={row}
            selected={selected}
          />
        )}
        {columns.map(column => (
          <TableCell
            id={`cell-${column.id}-${row[keyField]}`}
            key={`cell-${column.id}-${row[keyField]}`}
            column={column}
            row={row}
          />
        ))}
        {expandableRows && !expandableRowsHideExpander && (
          <TableCellExpander
            expanded={expanded}
            row={row}
            onRowExpandToggled={handleExpanded}
            disabled={defaultExpanderDisabled}
          />
        )}
      </TableRowStyle>

      {expandableRows && expanded && (
        <ExpanderRow
          key={`expander--${row[keyField]}`}
          data={row}
          extendedRowStyle={inheritStyles}
        >
          {expandableRowsComponent}
        </ExpanderRow>
      )}
    </>
  );
});

TableRow.propTypes = {
  id: PropTypes.any.isRequired,
  keyField: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  row: PropTypes.object.isRequired,
  onRowClicked: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onRowDoubleClicked: PropTypes.func.isRequired,
  onRowExpandToggled: PropTypes.func.isRequired,
  defaultExpanded: PropTypes.bool,
  defaultExpanderDisabled: PropTypes.bool,
  selectableRows: PropTypes.bool.isRequired,
  expandableRows: PropTypes.bool.isRequired,
  striped: PropTypes.bool.isRequired,
  highlightOnHover: PropTypes.bool.isRequired,
  pointerOnHover: PropTypes.bool.isRequired,
  dense: PropTypes.bool.isRequired,
  draggable: PropTypes.bool.isRequired,
  expandableRowsComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  expandableRowsHideExpander: PropTypes.bool.isRequired,
  expandOnRowClicked: PropTypes.bool.isRequired,
  expandOnRowDoubleClicked: PropTypes.bool.isRequired,
  conditionalRowStyles: PropTypes.array.isRequired,
  inheritConditionalStyles: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
  selectableRowsHighlight: PropTypes.bool.isRequired,
};

TableRow.defaultProps = {
  defaultExpanded: false,
  defaultExpanderDisabled: false,
};

export default TableRow;
