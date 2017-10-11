import React, { Component } from 'react';
import { line } from 'd3-shape';

import engine from 'react-chart-engine';

import ScrollableChart from './ScrollableChart';

const CalculateExtents = engine.utilities.CalculateExtents;

export default class ZoomDemoChart extends Component {
  constructor(props) {
    super(props);

    this.zoomState = {
      center: {
        x: 0.5,
        y: 0.5,
      },
      scale: 1,
    };
  }

  render() {
    const { zoomState } = this;
    const { data } = this.props;

    const { x, y } = CalculateExtents(data, 0.1);

    const limits = {
      x: [-Infinity, Infinity],
      y: [-Infinity, Infinity],
    };

    const onZoomStateChange = (newZoomState) => {
      console.log('Zoomed', newZoomState);
      this.zoomState = newZoomState;
    };

    return (
      <ScrollableChart
        xDomain={x} yDomain={y}
        maxScaleFactor={1000} limits={limits}
        zoomState={zoomState} onZoomStateChange={onZoomStateChange}
      >{
        (renderContext) => {
          const { xScale, yScale, innerWidth, innerHeight, margin } =
            renderContext;

          const [x1, x2] = xScale.domain();
          const domainDelta = Math.abs(x2 - x1);
          const ratio = Math.round(100 * domainDelta / innerWidth);

          const newData = data.filter((d, i) => {
            return ratio === 0 || (i % ratio) === 0;
          });

          const canvasRef = (canvas) => {
            if (!canvas) return;

            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, innerWidth, innerHeight);
            const path = line()
              .x(d => xScale(d.x))
              .y(d => yScale(d.y))
              .context(ctx);

            ctx.strokeStyle = '#666';
            ctx.beginPath();
            path(newData);
            ctx.stroke();
          };

          return (
            <g>
              <foreignObject
                x={margin.left} y={margin.top}
                width={innerWidth} height={innerHeight}>
                <canvas
                  width={innerWidth}
                  height={innerHeight}
                  style={{
                    position: 'relative',
                    zIndex: -1
                  }}
                  ref={canvasRef}
                />
              </foreignObject>
              {/*<g key="circles">
                {data.map(d =>
                  <circle r={5} cx={xScale(d.x)} cy={yScale(d.y)} key={d.id}

                    fill={'rgba(0,0,0,0.5)'}
                  />,
                )}
              </g>*/}
            </g>
          );
        }
      }</ScrollableChart>
    );
  }
}