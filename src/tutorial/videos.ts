// Os vídeos do tutorial, na ordem: doze da secretária e um do membro. Lida pelo Root.tsx e, no
// Node, por scripts/tutorial/gerar-roteiro.mjs e medir-voz.mjs: por isso os imports levam .ts.
import { S01 } from "./s01-primeiro-acesso.ts";
import { S02 } from "./s02-membros.ts";
import { S03 } from "./s03-telao.ts";
import { S04 } from "./s04-entrada.ts";
import { S05 } from "./s05-pauta.ts";
import { S06 } from "./s06-indicacao-celular.ts";
import { S07 } from "./s07-palavra.ts";
import { S08 } from "./s08-imprevistos.ts";
import { S09 } from "./s09-modos.ts";
import { S10 } from "./s10-lideres.ts";
import { S11 } from "./s11-ata.ts";
import { S12 } from "./s12-feedback.ts";
import { M1 } from "./m1-celular.ts";
import type { VideoTutorial } from "./tempo";

export const VIDEOS: VideoTutorial[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, M1];
