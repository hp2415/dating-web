import { PRIMARY, palette } from "../theme/color";

export default function WaveBg({ themeColor = PRIMARY }: { themeColor?: string }) {
  const lightColor = palette(themeColor, 200);
  const darkColor = palette(themeColor, 500);

  return (
    <div className="wave-bg" aria-hidden="true">
      <div className="wave-bg__top">
        <svg height="1337" width="1337">
          <defs>
            <path
              id="spark-wave-1"
              fillRule="evenodd"
              d="M1337,668.5 C1337,1037.455193874239 1037.455193874239,1337 668.5,1337 C523.6725684305388,1337 337,1236 370.50000000000006,1094 C434.03835568300906,824.6732385973953 6.906089672974592e-14,892.6277623047779 0,668.5000000000001 C0,299.5448061257611 299.5448061257609,1.1368683772161603e-13 668.4999999999999,0 C1037.455193874239,0 1337,299.544806125761 1337,668.5Z"
            />
            <linearGradient id="spark-wave-g1" x1="0.79" x2="0.21" y1="0.62" y2="0.86">
              <stop offset="0" stopColor={lightColor} />
              <stop offset="1" stopColor={darkColor} />
            </linearGradient>
          </defs>
          <use href="#spark-wave-1" fill="url(#spark-wave-g1)" />
        </svg>
      </div>
      <div className="wave-bg__bottom">
        <svg height="896" width="968">
          <defs>
            <path
              id="spark-wave-2"
              fillRule="evenodd"
              d="M896,448 C1142.6325445712241,465.5747656464056 695.2579309733121,896 448,896 C200.74206902668806,896 5.684341886080802e-14,695.2579309733121 0,448.0000000000001 C0,200.74206902668806 200.74206902668791,5.684341886080802e-14 447.99999999999994,0 C695.2579309733121,0 475,418 896,448Z"
            />
            <linearGradient id="spark-wave-g2" x1="0.5" x2="0.5" y1="0" y2="1">
              <stop offset="0" stopColor={lightColor} />
              <stop offset="1" stopColor={darkColor} />
            </linearGradient>
          </defs>
          <use href="#spark-wave-2" fill="url(#spark-wave-g2)" />
        </svg>
      </div>
    </div>
  );
}
