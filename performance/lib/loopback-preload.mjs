// Preloaded into the API process (both revisions, no app change needed) so the
// server listens on 127.0.0.1 only. It must never be reachable from the network.
import net from 'node:net';

const original = net.Server.prototype.listen;
net.Server.prototype.listen = function patched(...args) {
  const first = args[0];
  const isPort = typeof first === 'number' || (typeof first === 'string' && /^\d+$/.test(first));
  if (isPort && (args.length === 1 || typeof args[1] === 'function')) args.splice(1, 0, '127.0.0.1');
  return original.apply(this, args);
};
