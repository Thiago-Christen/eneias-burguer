import {execFileSync} from 'node:child_process';
process.env.SITE_BASE_PATH ||= '/eneias-burguer';
process.env.PUBLIC_SITE_URL ||= 'https://thiago-christen.github.io/eneias-burguer';
process.env.BUILD_OUTPUT_DIR ||= 'pages-dist';
execFileSync(process.execPath,[new URL('build.mjs',import.meta.url).pathname],{stdio:'inherit',env:process.env});
