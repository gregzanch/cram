const { sqrt, abs } = Math;

export function tred2(a: number[][], n: number, d: number[], e: number[]) {
    let l, k, j, i;
    let scale, hh, h, g, f;
    
    for (let i = n; i >= 2; i--) {
        l = i - 1;
        h = scale = 0.0;
        if (l > 1) {
            for (k = 1; k <= l; k++) {
                scale += abs(a[i][k]);
            }
            if (scale == 0.0) {
                e[i] = a[i][l];
            }
            else {
                for (k = 1; k <= l; k++) {
                    a[i][k] /= scale;
                    h += a[i][k] * a[i][k];
                }
                f = a[i][l];
                g = (f >= 0.0 ? -sqrt(h) : sqrt(h));
                e[i] = scale * g;
                h -= f * g;
                a[i][l] = f - g;
                f = 0.0;
                for (j = 1; j <= l; j++) {
                    a[j][i] = a[i][j] / h;
                    g = 0.0;
                    for (k = 1; k <= j; k++) {
                        g += a[j][k] * a[i][k];
                    }
                    for (k = j + 1; k <= l; k++) {
                        g += a[k][j] * a[i][k];
                    }
                    e[j] = g / h;
                    f += e[j] * a[i][j];
                }
                hh = f / (h + h);
                for (j = 1; j <= l; j++) {
                    f = a[i][j];
                    e[j] = g = e[j] - hh * f;
                    for (k = 1; k <= j; k++) {
                        a[j][k] -= (f * e[k] + g * a[i][k]);
                    }
                }
            }
        }
        else {
            e[i] = a[i][l];
        }
        
        d[i] = h;
    } 
    
    d[1] = 0.0;
    e[1] = 0.0;
    

    for (i = 1; i <= n; i++) {
        l = i - 1;
        if (d[i] != 0) {
            for (j = 1; j <= l; j++) {
                g = 0.0;
                for (k = 1; k <= l; k++) {
                    g += a[i][k] * a[k][j];
                }
                for (k = 1; k <= l; k++) {
                    a[k][j] -= g * a[k][i];
                }
            }
        }
        d[i] = a[i][i];
        a[i][i] = 1.0;
        for (j = 1; j <= l; j++){
            a[j][i] = a[i][j] = 0.0;
        } 
    }
    return { a, n, d, e };
    
}

// this is from Numerical Recipes in C.  It finds the eigenvalues
// and eigenvectors of an nxn tridiagonal symmetric matrix specified
// by d[] and e[].
export function tqli(d: number[], e: number[], n: number, z: number[][]) {
    let m, l, iter, i, k;
    let s, r, p, g, f, dd, c, b;
    
    for (i = 2; i <= n; i++) {
        e[i - 1] = e[i];
    }
    
    e[n] = 0.0;
    
    for (l = 1; l <= n; l++) {
        iter = 0;
        do {
            for (m = l; m <= n - 1; m++) {
                dd = abs(d[m]) + abs(d[m + 1]);
                if ((abs(e[m]) + dd) == dd) {
                    break;
                }
            }
            if (m != l) {
                if (iter++ == 30) {
                    console.warn("Too many iterations in tqli");
                }
                g = (d[l + 1] - d[l]) / (2.0 * e[l]);
                r = pythagorean(g, 1.0);
                g = d[m] - d[l] + e[l] / (g + sign(r, g));
                s = c = 1.0;
                p = 0.0;
                for (i = m - 1; i >= l; i--) {
                    f = s * e[i];
                    b = c * e[i];
                    e[i + 1] = r = pythagorean(f, g);
                    if (r == 0.0) {
                        d[i + 1] -= p;
                        e[m] = 0.0;
                        break;
                    }
                    s = f / r;
                    c = g / r;
                    g = d[i + 1] - p;
                    r = (d[i] - g) * s + 2.0 * c * b;
                    d[i + 1] = g + (p = s * r);
                    g = c * r - b;
                    for (k = 1; k <= n; k++) {
                        f = z[k][i + 1];
                        z[k][i + 1] = s * z[k][i] + c * f;
                        z[k][i] = c * z[k][i] - s * f;
                    }
                }
                if (r == 0.0 && i >= l) {
                    continue;
                }
                d[l] -= p;
                e[l] = g;
                e[m] = 0.0;
            }
        }
        while (m != l);
    }
    return { d, e, n, z };
}

export function pythagorean(a: number, b: number) {
    const absa = abs(a);
    const absb = abs(b);
    if (absa > absb) {
        return absa * sqrt(1.0 + (absb / absa) ** 2);
    }
    else {
        return (absb == 0.0 ? 0.0 : absb * sqrt(1.0 + (absa / absb) ** 2));
    }
}

export function sign(a: number, b: number) {
    return b >= 0 ? abs(a) : -abs(a);
}
  