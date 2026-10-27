import { useContext, useEffect, useRef } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

// BrowserRouter does not expose useBlocker. Guard its navigator and restore a
// native Back/Forward traversal before presenting the same save/discard dialog.
export default function useUnsavedResume(dirty, requestLeave) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const current = useRef({ dirty, requestLeave });
  current.current = { dirty, requestLeave };
  useEffect(() => {
    const push = navigator.push, replace = navigator.replace, go = navigator.go;
    let index = window.history.state?.idx ?? 0;
    let restoring = false, bypass = false, pending = null;
    navigator.push = (...args) => {
      const action = () => { push.apply(navigator, args); index = window.history.state?.idx ?? index; };
      if (current.current.dirty) current.current.requestLeave(action); else action();
    };
    navigator.replace = (...args) => {
      const action = () => replace.apply(navigator, args);
      if (current.current.dirty) current.current.requestLeave(action); else action();
    };
    navigator.go = delta => {
      const action = () => { bypass = true; go.call(navigator, delta); };
      if (current.current.dirty) current.current.requestLeave(action); else action();
    };
    const pop = event => {
      const next = event.state?.idx ?? 0;
      if (restoring) {
        event.stopImmediatePropagation(); restoring = false;
        const action = pending; pending = null;
        if (action) current.current.requestLeave(action);
        return;
      }
      if (bypass || !current.current.dirty) { bypass = false; index = next; return; }
      const delta = next - index;
      if (!delta) return;
      event.stopImmediatePropagation(); restoring = true;
      pending = () => { bypass = true; window.history.go(delta); };
      window.history.go(-delta);
    };
    const unload = event => { if (current.current.dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('popstate', pop, true);
    window.addEventListener('beforeunload', unload);
    return () => {
      navigator.push = push; navigator.replace = replace; navigator.go = go;
      window.removeEventListener('popstate', pop, true); window.removeEventListener('beforeunload', unload);
    };
  }, [navigator]);
}
