
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      function traceConnections(figure) {
        if (reducedMotion.matches) return;
        figure.querySelectorAll('.flow-trace').forEach(path => path.remove());
        const svg = [...figure.querySelectorAll('svg.diagram')].find(el => getComputedStyle(el).display !== 'none');
        if (!svg) return;
        const paths = [...svg.querySelectorAll('path.connector, path.connector-risk, path.connector-soft')];
        paths.forEach((path, index) => {
          const trace = path.cloneNode(false);
          trace.removeAttribute('style');
          trace.setAttribute('class', 'flow-trace');
          trace.setAttribute('pathLength', '100');
          trace.style.opacity = '0';
          svg.append(trace);
          const animation = trace.animate([
            { strokeDasharray: '0 100', opacity: 0 },
            { strokeDasharray: '35 100', strokeDashoffset: 0, opacity: 1, offset: .2 },
            { strokeDasharray: '35 100', strokeDashoffset: -100, opacity: 1, offset: .85 },
            { strokeDasharray: '35 100', strokeDashoffset: -100, opacity: 0 }
          ], { duration: 650, delay: index * (3100 / Math.max(1, paths.length - 1)), fill: 'both' });
          animation.onfinish = () => trace.remove();
        });
      }
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { traceConnections(entry.target); observer.unobserve(entry.target); }
      }), { threshold: .3 });
      document.querySelectorAll('.nature-article figure.figure').forEach((figure, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'figure-replay';
        button.textContent = '↻ Replay';
        button.setAttribute('aria-label', `Replay connections in figure ${index + 1}`);
        button.addEventListener('click', () => traceConnections(figure));
        figure.append(button);
        observer.observe(figure);
      });
      reducedMotion.addEventListener('change', event => {
        if (event.matches) document.querySelectorAll('.nature-article .flow-trace').forEach(path => path.remove());
      });
    