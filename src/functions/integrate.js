/**
* Calculate the numeric integration of a function
* @param {Function} f
* @param {number} start
* @param {number} end
* @param {number} [step=0.01]
*/
export default function integrate (f, start, end, step) {
 let total = 0
 step = step || 0.01
 for (let x = start; x < end; x += step) {
   if(isNaN(f(x + step / 2))) {
     return 99999;
   }
   total += f(x + step / 2) * step;
   if(total > 99999) {
     return 99999;
   }
 }
 return total;
}