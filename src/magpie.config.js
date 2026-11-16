import { mode, preview } from './variants';
export default {
  experimentId: '76',
  serverUrl: 'https://magpie-cogsciprag.fly.dev',
  socketUrl: preview ? null : 'wss://magpie-cogsciprag.fly.dev/socket',
  // this will be used in prolific mode
  completionUrl: 'https://app.prolific.com/submissions/complete?cc=CP20QS24',
  contactEmail: 'gemma.seghi@uni-tuebingen.de',
  // Either 'debug', 'directLink' or 'prolific'
  mode,
  language: 'en'
};
