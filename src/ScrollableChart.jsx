import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { scaleLinear } from 'd3-scale';

import {Motion, spring} from 'react-motion';

import engine from 'react-chart-engine';

const {
  ClipG,
  MarginG,
  FillParentSvg,
  BasicAxes,
  ZoomableG
} = engine.components;

const { UniqueId } = engine.utilities;

const backStyle = {
  fill: 'none',
  pointerEvents: 'all',
};

export default class ScrollableChart extends Component {
  constructor(props) {
    super(props);
    const id = props.id.length === 0 ? UniqueId() : props.id;
    this.state = {
      id,
      width: 500,
      height: 300,
    };
  }

  render() {
    const {
      margin,
      xDomain, yDomain,
      xPadding, yPadding,
      limits,
      zoomState,
      maxScaleFactor,
      onZoomStateChange,
      children,
    } = this.props;

    const zoomableGProps = {
      limits,
      zoomState,
      maxScaleFactor,
      onZoomStateChange,
    };

    const innerWidth = this.state.width - margin.left - margin.right;
    const innerHeight = this.state.height - margin.top - margin.bottom;
    const chartId = this.state.id;

    const onSizeUpdate = (size) => {
      this.setState(size);
    };
    const rawXScale = scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]);
    const rawYScale = scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);

    const springConfig = {stiffness: 50, damping: 20};

    return (
      <FillParentSvg onSizeUpdate={onSizeUpdate}>
        <MarginG left={margin.left} top={margin.top}>
          <ZoomableG
            xScale={rawXScale} yScale={rawYScale}
            {...zoomableGProps}
          >
            {({ xScale/*, yScale */, mouseHandlerRef }) => {
              const [x1, x2] = xScale.domain();
              return (<Motion
                defaultStyle={{x1: 0, x2: 0}}
                style={{
                  x1: spring(x1, springConfig),
                  x2: spring(x2, springConfig)}}
              >
                {({x1, x2}) => {
                  const yScale = rawYScale;

                  const newXScale = xScale.copy()
                    .domain([x1, x2]);

                  const renderContext = {
                    ...this.state,
                    margin,
                    xScale: newXScale,
                    yScale,
                    innerWidth,
                    innerHeight,
                  };

                  const renderedChildren = children(renderContext);
                  let chart;
                  let back;
                  let front;
                  if (renderedChildren.chart) {
                    chart = renderedChildren.chart;
                    back = renderedChildren.back;
                    front = renderedChildren.front;
                  } else {
                    chart = renderedChildren;
                  }

                  return (
                    <g>
                      {back}
                      <BasicAxes
                        xScale={newXScale}
                        yScale={yScale}
                        xPadding={xPadding}
                        yPadding={yPadding}
                        width={innerWidth}
                        height={innerHeight}
                      />
                      <ClipG id={chartId} width={innerWidth} height={innerHeight}>
                        <g ref={mouseHandlerRef}>
                          <rect width={innerWidth} height={innerHeight} style={backStyle} />
                          {chart}
                        </g>
                      </ClipG>
                      {front}
                    </g>
                  );
                }}
              </Motion>);
            }}
          </ZoomableG>
        </MarginG>
      </FillParentSvg>
    );
  }
}

ScrollableChart.defaultProps = {
  children: () => {},

  id: '',
  xDomain: [0, 72],
  yDomain: [0, 31],
  xPadding: 3,
  yPadding: 10,
  margin: {
    left: 30,
    right: 15,
    top: 10,
    bottom: 40,
  },

  limits: undefined,
  zoomState: undefined,
  maxScaleFactor: undefined,
  onZoomStateChange: undefined,
};

ScrollableChart.propTypes = {
  children: PropTypes.func,

  id: PropTypes.string,
  xDomain: PropTypes.arrayOf(PropTypes.number),
  yDomain: PropTypes.arrayOf(PropTypes.number),
  xPadding: PropTypes.number,
  yPadding: PropTypes.number,
  margin: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
  }),

  limits: PropTypes.shape({
    top: PropTypes.bool,
    right: PropTypes.bool,
    bottom: PropTypes.bool,
    left: PropTypes.bool,
  }),
  zoomState: PropTypes.shape({
    center: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
    scale: PropTypes.number,
  }),
  maxScaleFactor: PropTypes.number,
  onZoomStateChange: PropTypes.func,
};