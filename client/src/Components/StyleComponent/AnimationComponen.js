import React, { useEffect } from 'react';

const AnimationComponent = () => {
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!window.anmOff) {
        event = 'touchmove' === event.type ? event.changedTouches[0] : event;
        const { elements } = window.anm;
        const input = {
          x: event.clientX - window.innerWidth / 2 || 0,
          y: event.clientY - window.innerHeight / 2 || 0,
          fi:
            Math.atan(0 === input.x ? 1 / 0 : -input.y / input.x) +
            (input.x < 0 ? Math.PI : -input.y < 0 ? 2 * Math.PI : 0),
          s: (45 * Math.sin(2 * input.fi)) / 100,
          x: input.x / 100,
          y: input.y / 100,
          r:
            2 *
            (Math.sqrt(Math.pow(input.x, 2) + Math.pow(input.y, 2)) /
              Math.sqrt(
                Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
              )),
        };

        elements.forEach((element) => {
          const speed = getSpeed(element);
          const transformedValues = transformValues(input, speed);
          applyStyles(element, transformedValues);
        });
      }
    };

    const getSpeed = (element,e) => {
      const speeds = {};
      for (let i = 0; i < e.length; i++) {
        speeds[e[i]] = +element.getAttribute(`data-speed-${e[i]}`) || 0;
      }
      return speeds;
    };

    const transformValues = (input, speed) => {
      const values = {
        x: input.x * speed.x + 'px',
        y: input.y * speed.y + 'px',
        scale: 1 + input.r * speed.scale,
        opacity: 1 - input.r * Math.abs(speed.opacity),
        rotate: 100 * -input.s * input.r * speed.rotate + 'deg',
      };
      return values;
    };

    const applyStyles = (element, values,f) => {
      if (window.anmIsIE) {
        element.style.marginLeft = values.x;
        element.style.marginTop = values.y;
      } else {
        for (const key in f) {
          if (f.hasOwnProperty(key)) {
            element.style[key] = [
              f[key],
              '(',
              values.x + ',' + values.y,
              'translate' === f[key] ? '' : ',0',
              ') scale(',
              values.scale,
              ') rotate(',
              values.rotate,
              ')',
            ].join('');
          }
        }
        element.style.opacity = values.opacity;
        element.style.MozOpacity = values.opacity;
      }
    };

    const handleWindowResize = () => {
      window.anm.elements = document.querySelectorAll(window.anmAttr);
    };

    const initAnimation = () => {
      window.anmAttr = document.body.getAttribute('data-anm');
      window.anmIsIE =
        /MSIE.\d+\./gi.test(navigator.userAgent) &&
        +navigator.userAgent.replace(/.*MSIE.(\d+)\..*/gi, '$1') < 9;
      window.anmOff = false;

      if (window.anmAttr) {
        window.anm = {
          elements: document.querySelectorAll(window.anmAttr),
          on: () => {
            window.anmOff = false;
          },
          off: () => {
            window.anmOff = true;
          },
          toggle: () => {
            window.anmOff = !window.anmOff;
          },
        };

        window.anm.elements.forEach((element) => {
          applyStyles(element, {});
        });

        window.addEventListener('mousemove', handleMouseMove, false);
        window.addEventListener('touchmove', handleMouseMove, false);
        window.addEventListener('resize', handleWindowResize);

        return () => {
          window.removeEventListener('mousemove', handleMouseMove, false);
          window.removeEventListener('touchmove', handleMouseMove, false);
          window.removeEventListener('resize', handleWindowResize);
        };
      }
    };

    return initAnimation();
  }, []);

  return <div className="animation-container"></div>; // Add any desired container for the animation
};

export default AnimationComponent;
