// import { PDFDocument, rgb, degrees } from "pdf-lib";
// import * as fs from "fs/promises";
// import * as path from "path";
// import * as https from "https";
// import * as http from "http";
// import { ICardRenderer, CardRenderInput } from "../../domain/interfaces";

// // ── Helpers ───────────────────────────────────────────────────────────────────
// async function fetchImageBuffer(url: string): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const client = url.startsWith("https") ? https : http;
//     client
//       .get(url, (res) => {
//         const chunks: Buffer[] = [];
//         res.on("data", (chunk: Buffer) => chunks.push(chunk));
//         res.on("end", () => resolve(Buffer.concat(chunks)));
//         res.on("error", reject);
//       })
//       .on("error", reject);
//   });
// }

// async function loadImageBuffer(urlOrPath: string): Promise<Buffer | null> {
//   try {
//     if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
//       return await fetchImageBuffer(urlOrPath);
//     }
//     return await fs.readFile(urlOrPath);
//   } catch {
//     return null;
//   }
// }

// // ── Renderer ──────────────────────────────────────────────────────────────────
// export class CardRenderer implements ICardRenderer {
//   async render(input: CardRenderInput): Promise<Buffer> {
//     const doc = await PDFDocument.create();

//     // CR80 card: 85.6mm × 54mm = 242.83pt × 153.07pt
//     const W = 242.83;
//     const H = 153.07;
//     const page = doc.addPage([W, H]);

//     // ── Palette ───────────────────────────────────────────────────────────────
//     const navy = rgb(0.05, 0.13, 0.27); // #0D2145
//     const navyLight = rgb(0.09, 0.2, 0.42); // #173368
//     const gold = rgb(0.85, 0.68, 0.25); // #D9AE40
//     const goldLight = rgb(0.95, 0.82, 0.45); // #F2D173
//     const white = rgb(1, 1, 1);
//     const whiteDim = rgb(0.75, 0.8, 0.88);
//     const redAccent = rgb(0.78, 0.15, 0.18); // #C7262E — Moroccan red

//     // ── Background ────────────────────────────────────────────────────────────
//     page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: navy });

//     // Diagonal accent band (top-right)
//     page.drawRectangle({
//       x: W * 0.58,
//       y: 0,
//       width: W * 0.42,
//       height: H,
//       color: navyLight,
//       opacity: 0.6,
//     });

//     // Gold top stripe
//     page.drawRectangle({
//       x: 0,
//       y: H - 4,
//       width: W,
//       height: 4,
//       color: gold,
//     });

//     // Gold bottom stripe
//     page.drawRectangle({
//       x: 0,
//       y: 0,
//       width: W,
//       height: 3,
//       color: gold,
//     });

//     // Red accent bar (left edge)
//     page.drawRectangle({
//       x: 0,
//       y: 0,
//       width: 4,
//       height: H,
//       color: redAccent,
//     });

//     // Subtle diagonal lines for texture
//     for (let i = 0; i < 8; i++) {
//       page.drawLine({
//         start: { x: W * 0.55 + i * 12, y: H },
//         end: { x: W * 0.55 + i * 12 + 40, y: 0 },
//         thickness: 0.4,
//         color: white,
//         opacity: 0.04,
//       });
//     }

//     // ── Fonts ─────────────────────────────────────────────────────────────────
//     const { StandardFonts } = await import("pdf-lib");
//     const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
//     const fontReg = await doc.embedFont(StandardFonts.Helvetica);
//     const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

//     // ── Photo (left column) ───────────────────────────────────────────────────
//     const photoX = 12;
//     const photoY = H * 0.22;
//     const photoW = 46;
//     const photoH = 56;

//     if (input.photoUrl) {
//       const photoBuffer = await loadImageBuffer(input.photoUrl);
//       if (photoBuffer) {
//         try {
//           const mimeType = input.photoUrl.includes(".png") ? "png" : "jpg";
//           const photoEmbed =
//             mimeType === "png"
//               ? await doc.embedPng(photoBuffer)
//               : await doc.embedJpg(photoBuffer);

//           // Photo border (gold frame)
//           page.drawRectangle({
//             x: photoX - 1.5,
//             y: photoY - 1.5,
//             width: photoW + 3,
//             height: photoH + 3,
//             color: gold,
//             borderColor: goldLight,
//             borderWidth: 0.5,
//           });

//           page.drawImage(photoEmbed, {
//             x: photoX,
//             y: photoY,
//             width: photoW,
//             height: photoH,
//           });
//         } catch {
//           drawPhotoPlaceholder(
//             page,
//             photoX,
//             photoY,
//             photoW,
//             photoH,
//             navyLight,
//             gold,
//             fontReg,
//           );
//         }
//       } else {
//         drawPhotoPlaceholder(
//           page,
//           photoX,
//           photoY,
//           photoW,
//           photoH,
//           navyLight,
//           gold,
//           fontReg,
//         );
//       }
//     } else {
//       drawPhotoPlaceholder(
//         page,
//         photoX,
//         photoY,
//         photoW,
//         photoH,
//         navyLight,
//         gold,
//         fontReg,
//       );
//     }

//     // ── QR code ───────────────────────────────────────────────────────────────
//     const qrBuffer = Buffer.from(
//       input.qrDataUrl.replace(/^data:image\/png;base64,/, ""),
//       "base64",
//     );
//     const qrImage = await doc.embedPng(qrBuffer);

//     // QR background
//     page.drawRectangle({
//       x: photoX - 1,
//       y: 4,
//       width: photoW + 2,
//       height: photoW + 2,
//       color: white,
//       borderColor: gold,
//       borderWidth: 0.5,
//     });

//     page.drawImage(qrImage, {
//       x: photoX,
//       y: 5,
//       width: photoW,
//       height: photoW,
//     });

//     // ── Right content area ────────────────────────────────────────────────────
//     const contentX = 68;
//     const lineH = 13;
//     let curY = H - 14;

//     // Federation header
//     page.drawText("FÉDÉRATION NATIONALE", {
//       x: contentX,
//       y: curY,
//       size: 5.5,
//       font: fontBold,
//       color: gold,
//     });

//     curY -= 7;
//     page.drawText("DE SURF DU MAROC", {
//       x: contentX,
//       y: curY,
//       size: 5.5,
//       font: fontBold,
//       color: gold,
//     });

//     // Gold divider
//     curY -= 5;
//     page.drawLine({
//       start: { x: contentX, y: curY },
//       end: { x: contentX + 168, y: curY },
//       thickness: 0.8,
//       color: gold,
//     });

//     // CARTE DE MEMBRE label
//     curY -= 9;
//     page.drawText("CARTE DE MEMBRE", {
//       x: contentX,
//       y: curY,
//       size: 7,
//       font: fontBold,
//       color: white,
//     });

//     // Membership type badge
//     page.drawRectangle({
//       x: contentX + 105,
//       y: curY - 2,
//       width: 58,
//       height: 10,
//       color: redAccent,
//       borderColor: goldLight,
//       borderWidth: 0.3,
//     });
//     page.drawText("OFFICIELLE", {
//       x: contentX + 113,
//       y: curY + 1,
//       size: 5,
//       font: fontBold,
//       color: white,
//     });

//     // Full name
//     curY -= lineH;
//     const fullName = input.fullName.toUpperCase();
//     const nameFontSize = fullName.length > 22 ? 9 : 11;
//     page.drawText(fullName, {
//       x: contentX,
//       y: curY,
//       size: nameFontSize,
//       font: fontBold,
//       color: white,
//     });

//     // Disciplines
//     curY -= 10;
//     const disciplines = input.disciplines
//       .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
//       .join("  ·  ");
//     page.drawText(disciplines, {
//       x: contentX,
//       y: curY,
//       size: 6,
//       font: fontOblique,
//       color: goldLight,
//     });

//     // Thin separator
//     curY -= 7;
//     page.drawLine({
//       start: { x: contentX, y: curY },
//       end: { x: contentX + 168, y: curY },
//       thickness: 0.3,
//       color: white,
//       opacity: 0.2,
//     });

//     // License number row
//     curY -= 10;
//     page.drawText("N° LICENCE", {
//       x: contentX,
//       y: curY,
//       size: 5,
//       font: fontBold,
//       color: whiteDim,
//     });

//     page.drawText("SAISON", {
//       x: contentX + 95,
//       y: curY,
//       size: 5,
//       font: fontBold,
//       color: whiteDim,
//     });

//     curY -= 9;
//     page.drawText(input.licenseNumber, {
//       x: contentX,
//       y: curY,
//       size: 9,
//       font: fontBold,
//       color: gold,
//     });

//     page.drawText(String(input.season), {
//       x: contentX + 95,
//       y: curY,
//       size: 9,
//       font: fontBold,
//       color: gold,
//     });

//     // Validity row
//     curY -= 14;
//     page.drawText("VALIDE DU", {
//       x: contentX,
//       y: curY,
//       size: 5,
//       font: fontBold,
//       color: whiteDim,
//     });

//     page.drawText("AU", {
//       x: contentX + 88,
//       y: curY,
//       size: 5,
//       font: fontBold,
//       color: whiteDim,
//     });

//     curY -= 9;
//     if (input.validFrom && input.validUntil) {
//       page.drawText(formatDate(input.validFrom), {
//         x: contentX,
//         y: curY,
//         size: 7.5,
//         font: fontBold,
//         color: white,
//       });

//       page.drawText(formatDate(input.validUntil), {
//         x: contentX + 88,
//         y: curY,
//         size: 7.5,
//         font: fontBold,
//         color: white,
//       });
//     }

//     // ── Bottom bar ────────────────────────────────────────────────────────────
//     page.drawRectangle({
//       x: 4,
//       y: 3,
//       width: W - 8,
//       height: 10,
//       color: navyLight,
//       opacity: 0.7,
//     });

//     page.drawText("www.surfmaroc.ma", {
//       x: contentX,
//       y: 6,
//       size: 4.5,
//       font: fontOblique,
//       color: whiteDim,
//     });

//     page.drawText("Cette carte est la propriété de la FNSM", {
//       x: contentX + 75,
//       y: 6,
//       size: 4,
//       font: fontReg,
//       color: whiteDim,
//       opacity: 0.7,
//     });

//     const pdfBytes = await doc.save();
//     return Buffer.from(pdfBytes);
//   }
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function drawPhotoPlaceholder(
//   page: ReturnType<PDFDocument["addPage"]>,
//   x: number,
//   y: number,
//   w: number,
//   h: number,
//   bg: ReturnType<typeof rgb>,
//   border: ReturnType<typeof rgb>,
//   font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
// ): void {
//   page.drawRectangle({
//     x,
//     y,
//     width: w,
//     height: h,
//     color: bg,
//     borderColor: border,
//     borderWidth: 1,
//   });
//   page.drawText("PHOTO", {
//     x: x + w / 2 - 10,
//     y: y + h / 2 - 3,
//     size: 6,
//     font,
//     color: border,
//   });
// }

// function formatDate(date: Date): string {
//   return date.toLocaleDateString("fr-MA", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
// }
