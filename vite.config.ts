import
path from 'path';
import
{defineConfig,
loadEnv } from
import
react from "@vitejs/plugin-react';
'vite';
export default defineConfig(({ mode }) => {
const env = loadEnv (mode, '.', ');
return (
  base: '/TTT123/'
server:
port:
3000,
host:
'0.0.0.0',
｝，
plugins: [react ()]
define: {
'process. env.API_KEY': JSON. stringify(env. GEMINI_API_KEY),
'process. env. GEMINI_API_KEY': JSON. stringify(env.GEMINI_API_KEY)
},
resolve: {
alias: {
'@':
path.resolve(_dirname,
'),
};
}) ;
