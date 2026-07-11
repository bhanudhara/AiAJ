"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("middleware",{

/***/ "(middleware)/./lib/env.ts":
/*!********************!*\
  !*** ./lib/env.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSupabaseEnv: () => (/* binding */ getSupabaseEnv)\n/* harmony export */ });\nNEXT_PUBLIC_SUPABASE_URL = \"https://vcrcmbcolpguhbxrfdng.supabase.co\";\nNEXT_PUBLIC_SUPABASE_ANON_KEY = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcmNtYmNvbHBndWhieHJmZG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NTA4NTcsImV4cCI6MjA5OTMyNjg1N30.QTQ4JdJpa9qP94RwndOBf2BpwKVMi1KFAhiuqr-XDts\";\nN8N_WEBHOOK_URL = \"https://your-n8n-instance.example.com/webhook/assessment-trigger\";\nfunction getSupabaseEnv() {\n    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;\n    const anonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcmNtYmNvbHBndWhieHJmZG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NTA4NTcsImV4cCI6MjA5OTMyNjg1N30.QTQ4JdJpa9qP94RwndOBf2BpwKVMi1KFAhiuqr-XDts\";\n    if (!url || !anonKey) {\n        throw new Error(\"Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.\");\n    }\n    return {\n        url,\n        anonKey\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbGliL2Vudi50cyIsIm1hcHBpbmdzIjoiOzs7O0FBQUFBLDJCQUF5QjtBQUN6QkMsZ0NBQThCO0FBQzlCQyxrQkFBZ0I7QUFFVCxTQUFTQztJQUNkLE1BQU1DLE1BQU1DLFFBQVFDLEdBQUcsQ0FBQ04sd0JBQXdCO0lBQ2hELE1BQU1PLFVBQVU7SUFFaEIsSUFBSSxDQUFDSCxPQUFPLENBQUNHLFNBQVM7UUFDcEIsTUFBTSxJQUFJQyxNQUFNO0lBQ2xCO0lBRUEsT0FBTztRQUFFSjtRQUFLRztJQUFRO0FBQ3hCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL2xpYi9lbnYudHM/OTNmMiJdLCJzb3VyY2VzQ29udGVudCI6WyJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkw9XCJodHRwczovL3ZjcmNtYmNvbHBndWhieHJmZG5nLnN1cGFiYXNlLmNvXCJcclxuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVk9XCJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUp6ZFhCaFltRnpaU0lzSW5KbFppSTZJblpqY21OdFltTnZiSEJuZFdoaWVISm1aRzVuSWl3aWNtOXNaU0k2SW1GdWIyNGlMQ0pwWVhRaU9qRTNPRE0zTlRBNE5UY3NJbVY0Y0NJNk1qQTVPVE15TmpnMU4zMC5RVFE0SmRKcGE5cVA5NFJ3bmRPQmYyQnB3S1ZNaTFLRkFoaXVxci1YRHRzXCJcclxuTjhOX1dFQkhPT0tfVVJMPVwiaHR0cHM6Ly95b3VyLW44bi1pbnN0YW5jZS5leGFtcGxlLmNvbS93ZWJob29rL2Fzc2Vzc21lbnQtdHJpZ2dlclwiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3VwYWJhc2VFbnYoKSB7XHJcbiAgY29uc3QgdXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMO1xyXG4gIGNvbnN0IGFub25LZXkgPSBcImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwYzNNaU9pSnpkWEJoWW1GelpTSXNJbkpsWmlJNkluWmpjbU50WW1OdmJIQm5kV2hpZUhKbVpHNW5JaXdpY205c1pTSTZJbUZ1YjI0aUxDSnBZWFFpT2pFM09ETTNOVEE0TlRjc0ltVjRjQ0k2TWpBNU9UTXlOamcxTjMwLlFUUTRKZEpwYTlxUDk0UnduZE9CZjJCcHdLVk1pMUtGQWhpdXFyLVhEdHNcIjtcclxuXHJcbiAgaWYgKCF1cmwgfHwgIWFub25LZXkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBTdXBhYmFzZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuIEFkZCBORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwgYW5kIE5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIHRvIC5lbnYubG9jYWwuJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyB1cmwsIGFub25LZXkgfTtcclxufVxyXG4iXSwibmFtZXMiOlsiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJOOE5fV0VCSE9PS19VUkwiLCJnZXRTdXBhYmFzZUVudiIsInVybCIsInByb2Nlc3MiLCJlbnYiLCJhbm9uS2V5IiwiRXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./lib/env.ts\n");

/***/ })

});