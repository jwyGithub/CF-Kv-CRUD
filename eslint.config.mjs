import { eslint } from '@jiangweiye/eslint-config';

export default eslint({
    typescript: true,
    ignores: ['worker.js']
});
