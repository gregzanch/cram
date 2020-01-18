(WebGLUtils = (function() {
	var t = function(t) {
			return (
				'<div style="margin: auto; width:500px;z-index:10000;margin-top:20em;text-align:center;">' +
				t +
				"</div>"
			);
		},
		a =
			'This page requires a browser that supports WebGL.<br/><a href="http://get.webgl.org">Click here to upgrade your browser.</a>',
		r =
			'It doesn\'t appear your computer can support WebGL.<br/><a href="http://get.webgl.org">Click here for more information.</a>',
		n = function(n, e, u) {
			function i(n) {
				var o = document.getElementsByTagName("body")[0];
				if (o) {
					var e = window.WebGLRenderingContext ? r : a;
					n && (e += "<br/><br/>Status: " + n), (o.innerHTML = t(e));
				}
			}
			(u = u || i),
				n.addEventListener &&
					n.addEventListener(
						"webglcontextcreationerror",
						function(t) {
							u(t.statusMessage);
						},
						!1
					);
			var l = o(n, e);
			return l || u(window.WebGLRenderingContext ? "" : ""), l;
		},
		o = function(t, a) {
			for (
				var r = [
						"webgl",
						"experimental-webgl",
						"webkit-3d",
						"moz-webgl"
					],
					n = null,
					o = 0;
				o < r.length;
				++o
			) {
				try {
					n = t.getContext(r[o], a);
				} catch (t) {}
				if (n) break;
			}
			return n;
		};
	return {
		create3DContext: o,
		setupWebGL: n
	};
})()),
	window.requestAnimationFrame ||
		(window.requestAnimationFrame = (function() {
			return (
				window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(t, a) {
					window.setTimeout(t, 1e3 / 60);
				}
			);
		})()),
	window.cancelAnimationFrame ||
		(window.cancelAnimationFrame =
			window.cancelRequestAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.msCancelAnimationFrame ||
			window.msCancelRequestAnimationFrame ||
			window.oCancelAnimationFrame ||
			window.oCancelRequestAnimationFrame ||
			window.clearTimeout),
	!(function(t, a) {
		if ("object" == typeof exports && "object" == typeof module)
			module.exports = a();
		else if ("function" == typeof define && define.amd) define([], a);
		else {
			var r = a();
			for (var n in r)
				("object" == typeof exports ? exports : t)[n] = r[n];
		}
	})(this, function() {
		return (function(t) {
			function a(n) {
				if (r[n]) return r[n].exports;
				var o = (r[n] = {
					exports: {},
					id: n,
					loaded: !1
				});
				return (
					t[n].call(o.exports, o, o.exports, a),
					(o.loaded = !0),
					o.exports
				);
			}
			var r = {};
			return (a.m = t), (a.c = r), (a.p = ""), a(0);
		})([
			function(t, a, r) {
				(a.glMatrix = r(1)),
					(a.mat2 = r(2)),
					(a.mat2d = r(3)),
					(a.mat3 = r(4)),
					(a.mat4 = r(5)),
					(a.quat = r(6)),
					(a.vec2 = r(9)),
					(a.vec3 = r(7)),
					(a.vec4 = r(8));
			},
			function(t, a) {
				var r = {};
				(r.EPSILON = 1e-6),
					(r.ARRAY_TYPE =
						"undefined" != typeof Float32Array
							? Float32Array
							: Array),
					(r.RANDOM = Math.random),
					(r.ENABLE_SIMD = !1),
					(r.SIMD_AVAILABLE =
						r.ARRAY_TYPE === Float32Array && "SIMD" in this),
					(r.USE_SIMD = r.ENABLE_SIMD && r.SIMD_AVAILABLE),
					(r.setMatrixArrayType = function(t) {
						r.ARRAY_TYPE = t;
					});
				var n = Math.PI / 180;
				(r.toRadian = function(t) {
					return t * n;
				}),
					(r.equals = function(t, a) {
						return (
							Math.abs(t - a) <=
							r.EPSILON * Math.max(1, Math.abs(t), Math.abs(a))
						);
					}),
					(t.exports = r);
			},
			function(t, a, r) {
				var n = r(1),
					o = {};
				(o.create = function() {
					var t = new n.ARRAY_TYPE(4);
					return (t[0] = 1), (t[1] = 0), (t[2] = 0), (t[3] = 1), t;
				}),
					(o.clone = function(t) {
						var a = new n.ARRAY_TYPE(4);
						return (
							(a[0] = t[0]),
							(a[1] = t[1]),
							(a[2] = t[2]),
							(a[3] = t[3]),
							a
						);
					}),
					(o.copy = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = a[2]),
							(t[3] = a[3]),
							t
						);
					}),
					(o.identity = function(t) {
						return (
							(t[0] = 1), (t[1] = 0), (t[2] = 0), (t[3] = 1), t
						);
					}),
					(o.fromValues = function(t, a, r, o) {
						var e = new n.ARRAY_TYPE(4);
						return (
							(e[0] = t), (e[1] = a), (e[2] = r), (e[3] = o), e
						);
					}),
					(o.set = function(t, a, r, n, o) {
						return (
							(t[0] = a), (t[1] = r), (t[2] = n), (t[3] = o), t
						);
					}),
					(o.transpose = function(t, a) {
						if (t === a) {
							var r = a[1];
							(t[1] = a[2]), (t[2] = r);
						} else
							(t[0] = a[0]),
								(t[1] = a[2]),
								(t[2] = a[1]),
								(t[3] = a[3]);
						return t;
					}),
					(o.invert = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = r * e - o * n;
						return u
							? ((u = 1 / u),
							  (t[0] = e * u),
							  (t[1] = -n * u),
							  (t[2] = -o * u),
							  (t[3] = r * u),
							  t)
							: null;
					}),
					(o.adjoint = function(t, a) {
						var r = a[0];
						return (
							(t[0] = a[3]),
							(t[1] = -a[1]),
							(t[2] = -a[2]),
							(t[3] = r),
							t
						);
					}),
					(o.determinant = function(t) {
						return t[0] * t[3] - t[2] * t[1];
					}),
					(o.multiply = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = r[0],
							l = r[1],
							s = r[2],
							M = r[3];
						return (
							(t[0] = n * i + e * l),
							(t[1] = o * i + u * l),
							(t[2] = n * s + e * M),
							(t[3] = o * s + u * M),
							t
						);
					}),
					(o.mul = o.multiply),
					(o.rotate = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = Math.sin(r),
							l = Math.cos(r);
						return (
							(t[0] = n * l + e * i),
							(t[1] = o * l + u * i),
							(t[2] = n * -i + e * l),
							(t[3] = o * -i + u * l),
							t
						);
					}),
					(o.scale = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = r[0],
							l = r[1];
						return (
							(t[0] = n * i),
							(t[1] = o * i),
							(t[2] = e * l),
							(t[3] = u * l),
							t
						);
					}),
					(o.fromRotation = function(t, a) {
						var r = Math.sin(a),
							n = Math.cos(a);
						return (
							(t[0] = n), (t[1] = r), (t[2] = -r), (t[3] = n), t
						);
					}),
					(o.fromScaling = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = a[1]),
							t
						);
					}),
					(o.str = function(t) {
						return (
							"mat2(" +
							t[0] +
							", " +
							t[1] +
							", " +
							t[2] +
							", " +
							t[3] +
							")"
						);
					}),
					(o.frob = function(t) {
						return Math.sqrt(
							Math.pow(t[0], 2) +
								Math.pow(t[1], 2) +
								Math.pow(t[2], 2) +
								Math.pow(t[3], 2)
						);
					}),
					(o.LDU = function(t, a, r, n) {
						return (
							(t[2] = n[2] / n[0]),
							(r[0] = n[0]),
							(r[1] = n[1]),
							(r[3] = n[3] - t[2] * r[1]),
							[t, a, r]
						);
					}),
					(o.add = function(t, a, r) {
						return (
							(t[0] = a[0] + r[0]),
							(t[1] = a[1] + r[1]),
							(t[2] = a[2] + r[2]),
							(t[3] = a[3] + r[3]),
							t
						);
					}),
					(o.subtract = function(t, a, r) {
						return (
							(t[0] = a[0] - r[0]),
							(t[1] = a[1] - r[1]),
							(t[2] = a[2] - r[2]),
							(t[3] = a[3] - r[3]),
							t
						);
					}),
					(o.sub = o.subtract),
					(o.exactEquals = function(t, a) {
						return (
							t[0] === a[0] &&
							t[1] === a[1] &&
							t[2] === a[2] &&
							t[3] === a[3]
						);
					}),
					(o.equals = function(t, a) {
						var r = t[0],
							o = t[1],
							e = t[2],
							u = t[3],
							i = a[0],
							l = a[1],
							s = a[2],
							M = a[3];
						return (
							Math.abs(r - i) <=
								n.EPSILON *
									Math.max(1, Math.abs(r), Math.abs(i)) &&
							Math.abs(o - l) <=
								n.EPSILON *
									Math.max(1, Math.abs(o), Math.abs(l)) &&
							Math.abs(e - s) <=
								n.EPSILON *
									Math.max(1, Math.abs(e), Math.abs(s)) &&
							Math.abs(u - M) <=
								n.EPSILON *
									Math.max(1, Math.abs(u), Math.abs(M))
						);
					}),
					(o.multiplyScalar = function(t, a, r) {
						return (
							(t[0] = a[0] * r),
							(t[1] = a[1] * r),
							(t[2] = a[2] * r),
							(t[3] = a[3] * r),
							t
						);
					}),
					(o.multiplyScalarAndAdd = function(t, a, r, n) {
						return (
							(t[0] = a[0] + r[0] * n),
							(t[1] = a[1] + r[1] * n),
							(t[2] = a[2] + r[2] * n),
							(t[3] = a[3] + r[3] * n),
							t
						);
					}),
					(t.exports = o);
			},
			function(t, a, r) {
				var n = r(1),
					o = {};
				(o.create = function() {
					var t = new n.ARRAY_TYPE(6);
					return (
						(t[0] = 1),
						(t[1] = 0),
						(t[2] = 0),
						(t[3] = 1),
						(t[4] = 0),
						(t[5] = 0),
						t
					);
				}),
					(o.clone = function(t) {
						var a = new n.ARRAY_TYPE(6);
						return (
							(a[0] = t[0]),
							(a[1] = t[1]),
							(a[2] = t[2]),
							(a[3] = t[3]),
							(a[4] = t[4]),
							(a[5] = t[5]),
							a
						);
					}),
					(o.copy = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = a[2]),
							(t[3] = a[3]),
							(t[4] = a[4]),
							(t[5] = a[5]),
							t
						);
					}),
					(o.identity = function(t) {
						return (
							(t[0] = 1),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 1),
							(t[4] = 0),
							(t[5] = 0),
							t
						);
					}),
					(o.fromValues = function(t, a, r, o, e, u) {
						var i = new n.ARRAY_TYPE(6);
						return (
							(i[0] = t),
							(i[1] = a),
							(i[2] = r),
							(i[3] = o),
							(i[4] = e),
							(i[5] = u),
							i
						);
					}),
					(o.set = function(t, a, r, n, o, e, u) {
						return (
							(t[0] = a),
							(t[1] = r),
							(t[2] = n),
							(t[3] = o),
							(t[4] = e),
							(t[5] = u),
							t
						);
					}),
					(o.invert = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = a[4],
							i = a[5],
							l = r * e - n * o;
						return l
							? ((l = 1 / l),
							  (t[0] = e * l),
							  (t[1] = -n * l),
							  (t[2] = -o * l),
							  (t[3] = r * l),
							  (t[4] = (o * i - e * u) * l),
							  (t[5] = (n * u - r * i) * l),
							  t)
							: null;
					}),
					(o.determinant = function(t) {
						return t[0] * t[3] - t[1] * t[2];
					}),
					(o.multiply = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = a[4],
							l = a[5],
							s = r[0],
							M = r[1],
							c = r[2],
							h = r[3],
							f = r[4],
							m = r[5];
						return (
							(t[0] = n * s + e * M),
							(t[1] = o * s + u * M),
							(t[2] = n * c + e * h),
							(t[3] = o * c + u * h),
							(t[4] = n * f + e * m + i),
							(t[5] = o * f + u * m + l),
							t
						);
					}),
					(o.mul = o.multiply),
					(o.rotate = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = a[4],
							l = a[5],
							s = Math.sin(r),
							M = Math.cos(r);
						return (
							(t[0] = n * M + e * s),
							(t[1] = o * M + u * s),
							(t[2] = n * -s + e * M),
							(t[3] = o * -s + u * M),
							(t[4] = i),
							(t[5] = l),
							t
						);
					}),
					(o.scale = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = a[4],
							l = a[5],
							s = r[0],
							M = r[1];
						return (
							(t[0] = n * s),
							(t[1] = o * s),
							(t[2] = e * M),
							(t[3] = u * M),
							(t[4] = i),
							(t[5] = l),
							t
						);
					}),
					(o.translate = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = a[4],
							l = a[5],
							s = r[0],
							M = r[1];
						return (
							(t[0] = n),
							(t[1] = o),
							(t[2] = e),
							(t[3] = u),
							(t[4] = n * s + e * M + i),
							(t[5] = o * s + u * M + l),
							t
						);
					}),
					(o.fromRotation = function(t, a) {
						var r = Math.sin(a),
							n = Math.cos(a);
						return (
							(t[0] = n),
							(t[1] = r),
							(t[2] = -r),
							(t[3] = n),
							(t[4] = 0),
							(t[5] = 0),
							t
						);
					}),
					(o.fromScaling = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = a[1]),
							(t[4] = 0),
							(t[5] = 0),
							t
						);
					}),
					(o.fromTranslation = function(t, a) {
						return (
							(t[0] = 1),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 1),
							(t[4] = a[0]),
							(t[5] = a[1]),
							t
						);
					}),
					(o.str = function(t) {
						return (
							"mat2d(" +
							t[0] +
							", " +
							t[1] +
							", " +
							t[2] +
							", " +
							t[3] +
							", " +
							t[4] +
							", " +
							t[5] +
							")"
						);
					}),
					(o.frob = function(t) {
						return Math.sqrt(
							Math.pow(t[0], 2) +
								Math.pow(t[1], 2) +
								Math.pow(t[2], 2) +
								Math.pow(t[3], 2) +
								Math.pow(t[4], 2) +
								Math.pow(t[5], 2) +
								1
						);
					}),
					(o.add = function(t, a, r) {
						return (
							(t[0] = a[0] + r[0]),
							(t[1] = a[1] + r[1]),
							(t[2] = a[2] + r[2]),
							(t[3] = a[3] + r[3]),
							(t[4] = a[4] + r[4]),
							(t[5] = a[5] + r[5]),
							t
						);
					}),
					(o.subtract = function(t, a, r) {
						return (
							(t[0] = a[0] - r[0]),
							(t[1] = a[1] - r[1]),
							(t[2] = a[2] - r[2]),
							(t[3] = a[3] - r[3]),
							(t[4] = a[4] - r[4]),
							(t[5] = a[5] - r[5]),
							t
						);
					}),
					(o.sub = o.subtract),
					(o.multiplyScalar = function(t, a, r) {
						return (
							(t[0] = a[0] * r),
							(t[1] = a[1] * r),
							(t[2] = a[2] * r),
							(t[3] = a[3] * r),
							(t[4] = a[4] * r),
							(t[5] = a[5] * r),
							t
						);
					}),
					(o.multiplyScalarAndAdd = function(t, a, r, n) {
						return (
							(t[0] = a[0] + r[0] * n),
							(t[1] = a[1] + r[1] * n),
							(t[2] = a[2] + r[2] * n),
							(t[3] = a[3] + r[3] * n),
							(t[4] = a[4] + r[4] * n),
							(t[5] = a[5] + r[5] * n),
							t
						);
					}),
					(o.exactEquals = function(t, a) {
						return (
							t[0] === a[0] &&
							t[1] === a[1] &&
							t[2] === a[2] &&
							t[3] === a[3] &&
							t[4] === a[4] &&
							t[5] === a[5]
						);
					}),
					(o.equals = function(t, a) {
						var r = t[0],
							o = t[1],
							e = t[2],
							u = t[3],
							i = t[4],
							l = t[5],
							s = a[0],
							M = a[1],
							c = a[2],
							h = a[3],
							f = a[4],
							m = a[5];
						return (
							Math.abs(r - s) <=
								n.EPSILON *
									Math.max(1, Math.abs(r), Math.abs(s)) &&
							Math.abs(o - M) <=
								n.EPSILON *
									Math.max(1, Math.abs(o), Math.abs(M)) &&
							Math.abs(e - c) <=
								n.EPSILON *
									Math.max(1, Math.abs(e), Math.abs(c)) &&
							Math.abs(u - h) <=
								n.EPSILON *
									Math.max(1, Math.abs(u), Math.abs(h)) &&
							Math.abs(i - f) <=
								n.EPSILON *
									Math.max(1, Math.abs(i), Math.abs(f)) &&
							Math.abs(l - m) <=
								n.EPSILON *
									Math.max(1, Math.abs(l), Math.abs(m))
						);
					}),
					(t.exports = o);
			},
			function(t, a, r) {
				var n = r(1),
					o = {};
				(o.create = function() {
					var t = new n.ARRAY_TYPE(9);
					return (
						(t[0] = 1),
						(t[1] = 0),
						(t[2] = 0),
						(t[3] = 0),
						(t[4] = 1),
						(t[5] = 0),
						(t[6] = 0),
						(t[7] = 0),
						(t[8] = 1),
						t
					);
				}),
					(o.fromMat4 = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = a[2]),
							(t[3] = a[4]),
							(t[4] = a[5]),
							(t[5] = a[6]),
							(t[6] = a[8]),
							(t[7] = a[9]),
							(t[8] = a[10]),
							t
						);
					}),
					(o.clone = function(t) {
						var a = new n.ARRAY_TYPE(9);
						return (
							(a[0] = t[0]),
							(a[1] = t[1]),
							(a[2] = t[2]),
							(a[3] = t[3]),
							(a[4] = t[4]),
							(a[5] = t[5]),
							(a[6] = t[6]),
							(a[7] = t[7]),
							(a[8] = t[8]),
							a
						);
					}),
					(o.copy = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = a[2]),
							(t[3] = a[3]),
							(t[4] = a[4]),
							(t[5] = a[5]),
							(t[6] = a[6]),
							(t[7] = a[7]),
							(t[8] = a[8]),
							t
						);
					}),
					(o.fromValues = function(t, a, r, o, e, u, i, l, s) {
						var M = new n.ARRAY_TYPE(9);
						return (
							(M[0] = t),
							(M[1] = a),
							(M[2] = r),
							(M[3] = o),
							(M[4] = e),
							(M[5] = u),
							(M[6] = i),
							(M[7] = l),
							(M[8] = s),
							M
						);
					}),
					(o.set = function(t, a, r, n, o, e, u, i, l, s) {
						return (
							(t[0] = a),
							(t[1] = r),
							(t[2] = n),
							(t[3] = o),
							(t[4] = e),
							(t[5] = u),
							(t[6] = i),
							(t[7] = l),
							(t[8] = s),
							t
						);
					}),
					(o.identity = function(t) {
						return (
							(t[0] = 1),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 1),
							(t[5] = 0),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 1),
							t
						);
					}),
					(o.transpose = function(t, a) {
						if (t === a) {
							var r = a[1],
								n = a[2],
								o = a[5];
							(t[1] = a[3]),
								(t[2] = a[6]),
								(t[3] = r),
								(t[5] = a[7]),
								(t[6] = n),
								(t[7] = o);
						} else
							(t[0] = a[0]),
								(t[1] = a[3]),
								(t[2] = a[6]),
								(t[3] = a[1]),
								(t[4] = a[4]),
								(t[5] = a[7]),
								(t[6] = a[2]),
								(t[7] = a[5]),
								(t[8] = a[8]);
						return t;
					}),
					(o.invert = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = a[4],
							i = a[5],
							l = a[6],
							s = a[7],
							M = a[8],
							c = M * u - i * s,
							h = -M * e + i * l,
							f = s * e - u * l,
							m = r * c + n * h + o * f;
						return m
							? ((m = 1 / m),
							  (t[0] = c * m),
							  (t[1] = (-M * n + o * s) * m),
							  (t[2] = (i * n - o * u) * m),
							  (t[3] = h * m),
							  (t[4] = (M * r - o * l) * m),
							  (t[5] = (-i * r + o * e) * m),
							  (t[6] = f * m),
							  (t[7] = (-s * r + n * l) * m),
							  (t[8] = (u * r - n * e) * m),
							  t)
							: null;
					}),
					(o.adjoint = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = a[4],
							i = a[5],
							l = a[6],
							s = a[7],
							M = a[8];
						return (
							(t[0] = u * M - i * s),
							(t[1] = o * s - n * M),
							(t[2] = n * i - o * u),
							(t[3] = i * l - e * M),
							(t[4] = r * M - o * l),
							(t[5] = o * e - r * i),
							(t[6] = e * s - u * l),
							(t[7] = n * l - r * s),
							(t[8] = r * u - n * e),
							t
						);
					}),
					(o.determinant = function(t) {
						var a = t[0],
							r = t[1],
							n = t[2],
							o = t[3],
							e = t[4],
							u = t[5],
							i = t[6],
							l = t[7],
							s = t[8];
						return (
							a * (s * e - u * l) +
							r * (-s * o + u * i) +
							n * (l * o - e * i)
						);
					}),
					(o.multiply = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = a[4],
							l = a[5],
							s = a[6],
							M = a[7],
							c = a[8],
							h = r[0],
							f = r[1],
							m = r[2],
							S = r[3],
							x = r[4],
							I = r[5],
							d = r[6],
							D = r[7],
							F = r[8];
						return (
							(t[0] = h * n + f * u + m * s),
							(t[1] = h * o + f * i + m * M),
							(t[2] = h * e + f * l + m * c),
							(t[3] = S * n + x * u + I * s),
							(t[4] = S * o + x * i + I * M),
							(t[5] = S * e + x * l + I * c),
							(t[6] = d * n + D * u + F * s),
							(t[7] = d * o + D * i + F * M),
							(t[8] = d * e + D * l + F * c),
							t
						);
					}),
					(o.mul = o.multiply),
					(o.translate = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = a[4],
							l = a[5],
							s = a[6],
							M = a[7],
							c = a[8],
							h = r[0],
							f = r[1];
						return (
							(t[0] = n),
							(t[1] = o),
							(t[2] = e),
							(t[3] = u),
							(t[4] = i),
							(t[5] = l),
							(t[6] = h * n + f * u + s),
							(t[7] = h * o + f * i + M),
							(t[8] = h * e + f * l + c),
							t
						);
					}),
					(o.rotate = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = a[4],
							l = a[5],
							s = a[6],
							M = a[7],
							c = a[8],
							h = Math.sin(r),
							f = Math.cos(r);
						return (
							(t[0] = f * n + h * u),
							(t[1] = f * o + h * i),
							(t[2] = f * e + h * l),
							(t[3] = f * u - h * n),
							(t[4] = f * i - h * o),
							(t[5] = f * l - h * e),
							(t[6] = s),
							(t[7] = M),
							(t[8] = c),
							t
						);
					}),
					(o.scale = function(t, a, r) {
						var n = r[0],
							o = r[1];
						return (
							(t[0] = n * a[0]),
							(t[1] = n * a[1]),
							(t[2] = n * a[2]),
							(t[3] = o * a[3]),
							(t[4] = o * a[4]),
							(t[5] = o * a[5]),
							(t[6] = a[6]),
							(t[7] = a[7]),
							(t[8] = a[8]),
							t
						);
					}),
					(o.fromTranslation = function(t, a) {
						return (
							(t[0] = 1),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 1),
							(t[5] = 0),
							(t[6] = a[0]),
							(t[7] = a[1]),
							(t[8] = 1),
							t
						);
					}),
					(o.fromRotation = function(t, a) {
						var r = Math.sin(a),
							n = Math.cos(a);
						return (
							(t[0] = n),
							(t[1] = r),
							(t[2] = 0),
							(t[3] = -r),
							(t[4] = n),
							(t[5] = 0),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 1),
							t
						);
					}),
					(o.fromScaling = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = a[1]),
							(t[5] = 0),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 1),
							t
						);
					}),
					(o.fromMat2d = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = 0),
							(t[3] = a[2]),
							(t[4] = a[3]),
							(t[5] = 0),
							(t[6] = a[4]),
							(t[7] = a[5]),
							(t[8] = 1),
							t
						);
					}),
					(o.fromQuat = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = r + r,
							i = n + n,
							l = o + o,
							s = r * u,
							M = n * u,
							c = n * i,
							h = o * u,
							f = o * i,
							m = o * l,
							S = e * u,
							x = e * i,
							I = e * l;
						return (
							(t[0] = 1 - c - m),
							(t[3] = M - I),
							(t[6] = h + x),
							(t[1] = M + I),
							(t[4] = 1 - s - m),
							(t[7] = f - S),
							(t[2] = h - x),
							(t[5] = f + S),
							(t[8] = 1 - s - c),
							t
						);
					}),
					(o.normalFromMat4 = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = a[4],
							i = a[5],
							l = a[6],
							s = a[7],
							M = a[8],
							c = a[9],
							h = a[10],
							f = a[11],
							m = a[12],
							S = a[13],
							x = a[14],
							I = a[15],
							d = r * i - n * u,
							D = r * l - o * u,
							F = r * s - e * u,
							v = n * l - o * i,
							b = n * s - e * i,
							p = o * s - e * l,
							w = M * S - c * m,
							A = M * x - h * m,
							g = M * I - f * m,
							E = c * x - h * S,
							z = c * I - f * S,
							R = h * I - f * x,
							L = d * R - D * z + F * E + v * g - b * A + p * w;
						return L
							? ((L = 1 / L),
							  (t[0] = (i * R - l * z + s * E) * L),
							  (t[1] = (l * g - u * R - s * A) * L),
							  (t[2] = (u * z - i * g + s * w) * L),
							  (t[3] = (o * z - n * R - e * E) * L),
							  (t[4] = (r * R - o * g + e * A) * L),
							  (t[5] = (n * g - r * z - e * w) * L),
							  (t[6] = (S * p - x * b + I * v) * L),
							  (t[7] = (x * F - m * p - I * D) * L),
							  (t[8] = (m * b - S * F + I * d) * L),
							  t)
							: null;
					}),
					(o.str = function(t) {
						return (
							"mat3(" +
							t[0] +
							", " +
							t[1] +
							", " +
							t[2] +
							", " +
							t[3] +
							", " +
							t[4] +
							", " +
							t[5] +
							", " +
							t[6] +
							", " +
							t[7] +
							", " +
							t[8] +
							")"
						);
					}),
					(o.frob = function(t) {
						return Math.sqrt(
							Math.pow(t[0], 2) +
								Math.pow(t[1], 2) +
								Math.pow(t[2], 2) +
								Math.pow(t[3], 2) +
								Math.pow(t[4], 2) +
								Math.pow(t[5], 2) +
								Math.pow(t[6], 2) +
								Math.pow(t[7], 2) +
								Math.pow(t[8], 2)
						);
					}),
					(o.add = function(t, a, r) {
						return (
							(t[0] = a[0] + r[0]),
							(t[1] = a[1] + r[1]),
							(t[2] = a[2] + r[2]),
							(t[3] = a[3] + r[3]),
							(t[4] = a[4] + r[4]),
							(t[5] = a[5] + r[5]),
							(t[6] = a[6] + r[6]),
							(t[7] = a[7] + r[7]),
							(t[8] = a[8] + r[8]),
							t
						);
					}),
					(o.subtract = function(t, a, r) {
						return (
							(t[0] = a[0] - r[0]),
							(t[1] = a[1] - r[1]),
							(t[2] = a[2] - r[2]),
							(t[3] = a[3] - r[3]),
							(t[4] = a[4] - r[4]),
							(t[5] = a[5] - r[5]),
							(t[6] = a[6] - r[6]),
							(t[7] = a[7] - r[7]),
							(t[8] = a[8] - r[8]),
							t
						);
					}),
					(o.sub = o.subtract),
					(o.multiplyScalar = function(t, a, r) {
						return (
							(t[0] = a[0] * r),
							(t[1] = a[1] * r),
							(t[2] = a[2] * r),
							(t[3] = a[3] * r),
							(t[4] = a[4] * r),
							(t[5] = a[5] * r),
							(t[6] = a[6] * r),
							(t[7] = a[7] * r),
							(t[8] = a[8] * r),
							t
						);
					}),
					(o.multiplyScalarAndAdd = function(t, a, r, n) {
						return (
							(t[0] = a[0] + r[0] * n),
							(t[1] = a[1] + r[1] * n),
							(t[2] = a[2] + r[2] * n),
							(t[3] = a[3] + r[3] * n),
							(t[4] = a[4] + r[4] * n),
							(t[5] = a[5] + r[5] * n),
							(t[6] = a[6] + r[6] * n),
							(t[7] = a[7] + r[7] * n),
							(t[8] = a[8] + r[8] * n),
							t
						);
					}),
					(o.exactEquals = function(t, a) {
						return (
							t[0] === a[0] &&
							t[1] === a[1] &&
							t[2] === a[2] &&
							t[3] === a[3] &&
							t[4] === a[4] &&
							t[5] === a[5] &&
							t[6] === a[6] &&
							t[7] === a[7] &&
							t[8] === a[8]
						);
					}),
					(o.equals = function(t, a) {
						var r = t[0],
							o = t[1],
							e = t[2],
							u = t[3],
							i = t[4],
							l = t[5],
							s = t[6],
							M = t[7],
							c = t[8],
							h = a[0],
							f = a[1],
							m = a[2],
							S = a[3],
							x = a[4],
							I = a[5],
							d = t[6],
							D = a[7],
							F = a[8];
						return (
							Math.abs(r - h) <=
								n.EPSILON *
									Math.max(1, Math.abs(r), Math.abs(h)) &&
							Math.abs(o - f) <=
								n.EPSILON *
									Math.max(1, Math.abs(o), Math.abs(f)) &&
							Math.abs(e - m) <=
								n.EPSILON *
									Math.max(1, Math.abs(e), Math.abs(m)) &&
							Math.abs(u - S) <=
								n.EPSILON *
									Math.max(1, Math.abs(u), Math.abs(S)) &&
							Math.abs(i - x) <=
								n.EPSILON *
									Math.max(1, Math.abs(i), Math.abs(x)) &&
							Math.abs(l - I) <=
								n.EPSILON *
									Math.max(1, Math.abs(l), Math.abs(I)) &&
							Math.abs(s - d) <=
								n.EPSILON *
									Math.max(1, Math.abs(s), Math.abs(d)) &&
							Math.abs(M - D) <=
								n.EPSILON *
									Math.max(1, Math.abs(M), Math.abs(D)) &&
							Math.abs(c - F) <=
								n.EPSILON *
									Math.max(1, Math.abs(c), Math.abs(F))
						);
					}),
					(t.exports = o);
			},
			function(t, a, r) {
				var n = r(1),
					o = {
						scalar: {},
						SIMD: {}
					};
				(o.create = function() {
					var t = new n.ARRAY_TYPE(16);
					return (
						(t[0] = 1),
						(t[1] = 0),
						(t[2] = 0),
						(t[3] = 0),
						(t[4] = 0),
						(t[5] = 1),
						(t[6] = 0),
						(t[7] = 0),
						(t[8] = 0),
						(t[9] = 0),
						(t[10] = 1),
						(t[11] = 0),
						(t[12] = 0),
						(t[13] = 0),
						(t[14] = 0),
						(t[15] = 1),
						t
					);
				}),
					(o.clone = function(t) {
						var a = new n.ARRAY_TYPE(16);
						return (
							(a[0] = t[0]),
							(a[1] = t[1]),
							(a[2] = t[2]),
							(a[3] = t[3]),
							(a[4] = t[4]),
							(a[5] = t[5]),
							(a[6] = t[6]),
							(a[7] = t[7]),
							(a[8] = t[8]),
							(a[9] = t[9]),
							(a[10] = t[10]),
							(a[11] = t[11]),
							(a[12] = t[12]),
							(a[13] = t[13]),
							(a[14] = t[14]),
							(a[15] = t[15]),
							a
						);
					}),
					(o.copy = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = a[2]),
							(t[3] = a[3]),
							(t[4] = a[4]),
							(t[5] = a[5]),
							(t[6] = a[6]),
							(t[7] = a[7]),
							(t[8] = a[8]),
							(t[9] = a[9]),
							(t[10] = a[10]),
							(t[11] = a[11]),
							(t[12] = a[12]),
							(t[13] = a[13]),
							(t[14] = a[14]),
							(t[15] = a[15]),
							t
						);
					}),
					(o.fromValues = function(
						t,
						a,
						r,
						o,
						e,
						u,
						i,
						l,
						s,
						M,
						c,
						h,
						f,
						m,
						S,
						x
					) {
						var I = new n.ARRAY_TYPE(16);
						return (
							(I[0] = t),
							(I[1] = a),
							(I[2] = r),
							(I[3] = o),
							(I[4] = e),
							(I[5] = u),
							(I[6] = i),
							(I[7] = l),
							(I[8] = s),
							(I[9] = M),
							(I[10] = c),
							(I[11] = h),
							(I[12] = f),
							(I[13] = m),
							(I[14] = S),
							(I[15] = x),
							I
						);
					}),
					(o.set = function(
						t,
						a,
						r,
						n,
						o,
						e,
						u,
						i,
						l,
						s,
						M,
						c,
						h,
						f,
						m,
						S,
						x
					) {
						return (
							(t[0] = a),
							(t[1] = r),
							(t[2] = n),
							(t[3] = o),
							(t[4] = e),
							(t[5] = u),
							(t[6] = i),
							(t[7] = l),
							(t[8] = s),
							(t[9] = M),
							(t[10] = c),
							(t[11] = h),
							(t[12] = f),
							(t[13] = m),
							(t[14] = S),
							(t[15] = x),
							t
						);
					}),
					(o.identity = function(t) {
						return (
							(t[0] = 1),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = 1),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 0),
							(t[9] = 0),
							(t[10] = 1),
							(t[11] = 0),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = 0),
							(t[15] = 1),
							t
						);
					}),
					(o.scalar.transpose = function(t, a) {
						if (t === a) {
							var r = a[1],
								n = a[2],
								o = a[3],
								e = a[6],
								u = a[7],
								i = a[11];
							(t[1] = a[4]),
								(t[2] = a[8]),
								(t[3] = a[12]),
								(t[4] = r),
								(t[6] = a[9]),
								(t[7] = a[13]),
								(t[8] = n),
								(t[9] = e),
								(t[11] = a[14]),
								(t[12] = o),
								(t[13] = u),
								(t[14] = i);
						} else
							(t[0] = a[0]),
								(t[1] = a[4]),
								(t[2] = a[8]),
								(t[3] = a[12]),
								(t[4] = a[1]),
								(t[5] = a[5]),
								(t[6] = a[9]),
								(t[7] = a[13]),
								(t[8] = a[2]),
								(t[9] = a[6]),
								(t[10] = a[10]),
								(t[11] = a[14]),
								(t[12] = a[3]),
								(t[13] = a[7]),
								(t[14] = a[11]),
								(t[15] = a[15]);
						return t;
					}),
					(o.SIMD.transpose = function(t, a) {
						var r, n, o, e, u, i, l, s, M, c;
						return (
							(r = SIMD.Float32x4.load(a, 0)),
							(n = SIMD.Float32x4.load(a, 4)),
							(o = SIMD.Float32x4.load(a, 8)),
							(e = SIMD.Float32x4.load(a, 12)),
							(u = SIMD.Float32x4.shuffle(r, n, 0, 1, 4, 5)),
							(i = SIMD.Float32x4.shuffle(o, e, 0, 1, 4, 5)),
							(l = SIMD.Float32x4.shuffle(u, i, 0, 2, 4, 6)),
							(s = SIMD.Float32x4.shuffle(u, i, 1, 3, 5, 7)),
							SIMD.Float32x4.store(t, 0, l),
							SIMD.Float32x4.store(t, 4, s),
							(u = SIMD.Float32x4.shuffle(r, n, 2, 3, 6, 7)),
							(i = SIMD.Float32x4.shuffle(o, e, 2, 3, 6, 7)),
							(M = SIMD.Float32x4.shuffle(u, i, 0, 2, 4, 6)),
							(c = SIMD.Float32x4.shuffle(u, i, 1, 3, 5, 7)),
							SIMD.Float32x4.store(t, 8, M),
							SIMD.Float32x4.store(t, 12, c),
							t
						);
					}),
					(o.transpose = n.USE_SIMD
						? o.SIMD.transpose
						: o.scalar.transpose),
					(o.scalar.invert = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = a[4],
							i = a[5],
							l = a[6],
							s = a[7],
							M = a[8],
							c = a[9],
							h = a[10],
							f = a[11],
							m = a[12],
							S = a[13],
							x = a[14],
							I = a[15],
							d = r * i - n * u,
							D = r * l - o * u,
							F = r * s - e * u,
							v = n * l - o * i,
							b = n * s - e * i,
							p = o * s - e * l,
							w = M * S - c * m,
							A = M * x - h * m,
							g = M * I - f * m,
							E = c * x - h * S,
							z = c * I - f * S,
							R = h * I - f * x,
							L = d * R - D * z + F * E + v * g - b * A + p * w;
						return L
							? ((L = 1 / L),
							  (t[0] = (i * R - l * z + s * E) * L),
							  (t[1] = (o * z - n * R - e * E) * L),
							  (t[2] = (S * p - x * b + I * v) * L),
							  (t[3] = (h * b - c * p - f * v) * L),
							  (t[4] = (l * g - u * R - s * A) * L),
							  (t[5] = (r * R - o * g + e * A) * L),
							  (t[6] = (x * F - m * p - I * D) * L),
							  (t[7] = (M * p - h * F + f * D) * L),
							  (t[8] = (u * z - i * g + s * w) * L),
							  (t[9] = (n * g - r * z - e * w) * L),
							  (t[10] = (m * b - S * F + I * d) * L),
							  (t[11] = (c * F - M * b - f * d) * L),
							  (t[12] = (i * A - u * E - l * w) * L),
							  (t[13] = (r * E - n * A + o * w) * L),
							  (t[14] = (S * D - m * v - x * d) * L),
							  (t[15] = (M * v - c * D + h * d) * L),
							  t)
							: null;
					}),
					(o.SIMD.invert = function(t, a) {
						var r,
							n,
							o,
							e,
							u,
							i,
							l,
							s,
							M,
							c,
							h = SIMD.Float32x4.load(a, 0),
							f = SIMD.Float32x4.load(a, 4),
							m = SIMD.Float32x4.load(a, 8),
							S = SIMD.Float32x4.load(a, 12);
						return (
							(u = SIMD.Float32x4.shuffle(h, f, 0, 1, 4, 5)),
							(n = SIMD.Float32x4.shuffle(m, S, 0, 1, 4, 5)),
							(r = SIMD.Float32x4.shuffle(u, n, 0, 2, 4, 6)),
							(n = SIMD.Float32x4.shuffle(n, u, 1, 3, 5, 7)),
							(u = SIMD.Float32x4.shuffle(h, f, 2, 3, 6, 7)),
							(e = SIMD.Float32x4.shuffle(m, S, 2, 3, 6, 7)),
							(o = SIMD.Float32x4.shuffle(u, e, 0, 2, 4, 6)),
							(e = SIMD.Float32x4.shuffle(e, u, 1, 3, 5, 7)),
							(u = SIMD.Float32x4.mul(o, e)),
							(u = SIMD.Float32x4.swizzle(u, 1, 0, 3, 2)),
							(i = SIMD.Float32x4.mul(n, u)),
							(l = SIMD.Float32x4.mul(r, u)),
							(u = SIMD.Float32x4.swizzle(u, 2, 3, 0, 1)),
							(i = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(n, u),
								i
							)),
							(l = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(r, u),
								l
							)),
							(l = SIMD.Float32x4.swizzle(l, 2, 3, 0, 1)),
							(u = SIMD.Float32x4.mul(n, o)),
							(u = SIMD.Float32x4.swizzle(u, 1, 0, 3, 2)),
							(i = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(e, u),
								i
							)),
							(M = SIMD.Float32x4.mul(r, u)),
							(u = SIMD.Float32x4.swizzle(u, 2, 3, 0, 1)),
							(i = SIMD.Float32x4.sub(
								i,
								SIMD.Float32x4.mul(e, u)
							)),
							(M = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(r, u),
								M
							)),
							(M = SIMD.Float32x4.swizzle(M, 2, 3, 0, 1)),
							(u = SIMD.Float32x4.mul(
								SIMD.Float32x4.swizzle(n, 2, 3, 0, 1),
								e
							)),
							(u = SIMD.Float32x4.swizzle(u, 1, 0, 3, 2)),
							(o = SIMD.Float32x4.swizzle(o, 2, 3, 0, 1)),
							(i = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(o, u),
								i
							)),
							(s = SIMD.Float32x4.mul(r, u)),
							(u = SIMD.Float32x4.swizzle(u, 2, 3, 0, 1)),
							(i = SIMD.Float32x4.sub(
								i,
								SIMD.Float32x4.mul(o, u)
							)),
							(s = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(r, u),
								s
							)),
							(s = SIMD.Float32x4.swizzle(s, 2, 3, 0, 1)),
							(u = SIMD.Float32x4.mul(r, n)),
							(u = SIMD.Float32x4.swizzle(u, 1, 0, 3, 2)),
							(s = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(e, u),
								s
							)),
							(M = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(o, u),
								M
							)),
							(u = SIMD.Float32x4.swizzle(u, 2, 3, 0, 1)),
							(s = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(e, u),
								s
							)),
							(M = SIMD.Float32x4.sub(
								M,
								SIMD.Float32x4.mul(o, u)
							)),
							(u = SIMD.Float32x4.mul(r, e)),
							(u = SIMD.Float32x4.swizzle(u, 1, 0, 3, 2)),
							(l = SIMD.Float32x4.sub(
								l,
								SIMD.Float32x4.mul(o, u)
							)),
							(s = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(n, u),
								s
							)),
							(u = SIMD.Float32x4.swizzle(u, 2, 3, 0, 1)),
							(l = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(o, u),
								l
							)),
							(s = SIMD.Float32x4.sub(
								s,
								SIMD.Float32x4.mul(n, u)
							)),
							(u = SIMD.Float32x4.mul(r, o)),
							(u = SIMD.Float32x4.swizzle(u, 1, 0, 3, 2)),
							(l = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(e, u),
								l
							)),
							(M = SIMD.Float32x4.sub(
								M,
								SIMD.Float32x4.mul(n, u)
							)),
							(u = SIMD.Float32x4.swizzle(u, 2, 3, 0, 1)),
							(l = SIMD.Float32x4.sub(
								l,
								SIMD.Float32x4.mul(e, u)
							)),
							(M = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(n, u),
								M
							)),
							(c = SIMD.Float32x4.mul(r, i)),
							(c = SIMD.Float32x4.add(
								SIMD.Float32x4.swizzle(c, 2, 3, 0, 1),
								c
							)),
							(c = SIMD.Float32x4.add(
								SIMD.Float32x4.swizzle(c, 1, 0, 3, 2),
								c
							)),
							(u = SIMD.Float32x4.reciprocalApproximation(c)),
							(c = SIMD.Float32x4.sub(
								SIMD.Float32x4.add(u, u),
								SIMD.Float32x4.mul(c, SIMD.Float32x4.mul(u, u))
							)),
							(c = SIMD.Float32x4.swizzle(c, 0, 0, 0, 0))
								? (SIMD.Float32x4.store(
										t,
										0,
										SIMD.Float32x4.mul(c, i)
								  ),
								  SIMD.Float32x4.store(
										t,
										4,
										SIMD.Float32x4.mul(c, l)
								  ),
								  SIMD.Float32x4.store(
										t,
										8,
										SIMD.Float32x4.mul(c, s)
								  ),
								  SIMD.Float32x4.store(
										t,
										12,
										SIMD.Float32x4.mul(c, M)
								  ),
								  t)
								: null
						);
					}),
					(o.invert = n.USE_SIMD ? o.SIMD.invert : o.scalar.invert),
					(o.scalar.adjoint = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = a[4],
							i = a[5],
							l = a[6],
							s = a[7],
							M = a[8],
							c = a[9],
							h = a[10],
							f = a[11],
							m = a[12],
							S = a[13],
							x = a[14],
							I = a[15];
						return (
							(t[0] =
								i * (h * I - f * x) -
								c * (l * I - s * x) +
								S * (l * f - s * h)),
							(t[1] = -(
								n * (h * I - f * x) -
								c * (o * I - e * x) +
								S * (o * f - e * h)
							)),
							(t[2] =
								n * (l * I - s * x) -
								i * (o * I - e * x) +
								S * (o * s - e * l)),
							(t[3] = -(
								n * (l * f - s * h) -
								i * (o * f - e * h) +
								c * (o * s - e * l)
							)),
							(t[4] = -(
								u * (h * I - f * x) -
								M * (l * I - s * x) +
								m * (l * f - s * h)
							)),
							(t[5] =
								r * (h * I - f * x) -
								M * (o * I - e * x) +
								m * (o * f - e * h)),
							(t[6] = -(
								r * (l * I - s * x) -
								u * (o * I - e * x) +
								m * (o * s - e * l)
							)),
							(t[7] =
								r * (l * f - s * h) -
								u * (o * f - e * h) +
								M * (o * s - e * l)),
							(t[8] =
								u * (c * I - f * S) -
								M * (i * I - s * S) +
								m * (i * f - s * c)),
							(t[9] = -(
								r * (c * I - f * S) -
								M * (n * I - e * S) +
								m * (n * f - e * c)
							)),
							(t[10] =
								r * (i * I - s * S) -
								u * (n * I - e * S) +
								m * (n * s - e * i)),
							(t[11] = -(
								r * (i * f - s * c) -
								u * (n * f - e * c) +
								M * (n * s - e * i)
							)),
							(t[12] = -(
								u * (c * x - h * S) -
								M * (i * x - l * S) +
								m * (i * h - l * c)
							)),
							(t[13] =
								r * (c * x - h * S) -
								M * (n * x - o * S) +
								m * (n * h - o * c)),
							(t[14] = -(
								r * (i * x - l * S) -
								u * (n * x - o * S) +
								m * (n * l - o * i)
							)),
							(t[15] =
								r * (i * h - l * c) -
								u * (n * h - o * c) +
								M * (n * l - o * i)),
							t
						);
					}),
					(o.SIMD.adjoint = function(t, a) {
						var r,
							n,
							o,
							e,
							u,
							i,
							l,
							s,
							M,
							c,
							h,
							f,
							m,
							r = SIMD.Float32x4.load(a, 0),
							n = SIMD.Float32x4.load(a, 4),
							o = SIMD.Float32x4.load(a, 8),
							e = SIMD.Float32x4.load(a, 12);
						return (
							(M = SIMD.Float32x4.shuffle(r, n, 0, 1, 4, 5)),
							(i = SIMD.Float32x4.shuffle(o, e, 0, 1, 4, 5)),
							(u = SIMD.Float32x4.shuffle(M, i, 0, 2, 4, 6)),
							(i = SIMD.Float32x4.shuffle(i, M, 1, 3, 5, 7)),
							(M = SIMD.Float32x4.shuffle(r, n, 2, 3, 6, 7)),
							(s = SIMD.Float32x4.shuffle(o, e, 2, 3, 6, 7)),
							(l = SIMD.Float32x4.shuffle(M, s, 0, 2, 4, 6)),
							(s = SIMD.Float32x4.shuffle(s, M, 1, 3, 5, 7)),
							(M = SIMD.Float32x4.mul(l, s)),
							(M = SIMD.Float32x4.swizzle(M, 1, 0, 3, 2)),
							(c = SIMD.Float32x4.mul(i, M)),
							(h = SIMD.Float32x4.mul(u, M)),
							(M = SIMD.Float32x4.swizzle(M, 2, 3, 0, 1)),
							(c = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(i, M),
								c
							)),
							(h = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(u, M),
								h
							)),
							(h = SIMD.Float32x4.swizzle(h, 2, 3, 0, 1)),
							(M = SIMD.Float32x4.mul(i, l)),
							(M = SIMD.Float32x4.swizzle(M, 1, 0, 3, 2)),
							(c = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(s, M),
								c
							)),
							(m = SIMD.Float32x4.mul(u, M)),
							(M = SIMD.Float32x4.swizzle(M, 2, 3, 0, 1)),
							(c = SIMD.Float32x4.sub(
								c,
								SIMD.Float32x4.mul(s, M)
							)),
							(m = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(u, M),
								m
							)),
							(m = SIMD.Float32x4.swizzle(m, 2, 3, 0, 1)),
							(M = SIMD.Float32x4.mul(
								SIMD.Float32x4.swizzle(i, 2, 3, 0, 1),
								s
							)),
							(M = SIMD.Float32x4.swizzle(M, 1, 0, 3, 2)),
							(l = SIMD.Float32x4.swizzle(l, 2, 3, 0, 1)),
							(c = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(l, M),
								c
							)),
							(f = SIMD.Float32x4.mul(u, M)),
							(M = SIMD.Float32x4.swizzle(M, 2, 3, 0, 1)),
							(c = SIMD.Float32x4.sub(
								c,
								SIMD.Float32x4.mul(l, M)
							)),
							(f = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(u, M),
								f
							)),
							(f = SIMD.Float32x4.swizzle(f, 2, 3, 0, 1)),
							(M = SIMD.Float32x4.mul(u, i)),
							(M = SIMD.Float32x4.swizzle(M, 1, 0, 3, 2)),
							(f = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(s, M),
								f
							)),
							(m = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(l, M),
								m
							)),
							(M = SIMD.Float32x4.swizzle(M, 2, 3, 0, 1)),
							(f = SIMD.Float32x4.sub(
								SIMD.Float32x4.mul(s, M),
								f
							)),
							(m = SIMD.Float32x4.sub(
								m,
								SIMD.Float32x4.mul(l, M)
							)),
							(M = SIMD.Float32x4.mul(u, s)),
							(M = SIMD.Float32x4.swizzle(M, 1, 0, 3, 2)),
							(h = SIMD.Float32x4.sub(
								h,
								SIMD.Float32x4.mul(l, M)
							)),
							(f = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(i, M),
								f
							)),
							(M = SIMD.Float32x4.swizzle(M, 2, 3, 0, 1)),
							(h = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(l, M),
								h
							)),
							(f = SIMD.Float32x4.sub(
								f,
								SIMD.Float32x4.mul(i, M)
							)),
							(M = SIMD.Float32x4.mul(u, l)),
							(M = SIMD.Float32x4.swizzle(M, 1, 0, 3, 2)),
							(h = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(s, M),
								h
							)),
							(m = SIMD.Float32x4.sub(
								m,
								SIMD.Float32x4.mul(i, M)
							)),
							(M = SIMD.Float32x4.swizzle(M, 2, 3, 0, 1)),
							(h = SIMD.Float32x4.sub(
								h,
								SIMD.Float32x4.mul(s, M)
							)),
							(m = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(i, M),
								m
							)),
							SIMD.Float32x4.store(t, 0, c),
							SIMD.Float32x4.store(t, 4, h),
							SIMD.Float32x4.store(t, 8, f),
							SIMD.Float32x4.store(t, 12, m),
							t
						);
					}),
					(o.adjoint = n.USE_SIMD
						? o.SIMD.adjoint
						: o.scalar.adjoint),
					(o.determinant = function(t) {
						var a = t[0],
							r = t[1],
							n = t[2],
							o = t[3],
							e = t[4],
							u = t[5],
							i = t[6],
							l = t[7],
							s = t[8],
							M = t[9],
							c = t[10],
							h = t[11],
							f = t[12],
							m = t[13],
							S = t[14],
							x = t[15],
							I = a * u - r * e,
							d = a * i - n * e,
							D = a * l - o * e,
							F = r * i - n * u,
							v = r * l - o * u,
							b = n * l - o * i,
							p = s * m - M * f,
							w = s * S - c * f,
							A = s * x - h * f,
							g = M * S - c * m,
							E = M * x - h * m,
							z = c * x - h * S;
						return I * z - d * E + D * g + F * A - v * w + b * p;
					}),
					(o.SIMD.multiply = function(t, a, r) {
						var n = SIMD.Float32x4.load(a, 0),
							o = SIMD.Float32x4.load(a, 4),
							e = SIMD.Float32x4.load(a, 8),
							u = SIMD.Float32x4.load(a, 12),
							i = SIMD.Float32x4.load(r, 0),
							l = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(
									SIMD.Float32x4.swizzle(i, 0, 0, 0, 0),
									n
								),
								SIMD.Float32x4.add(
									SIMD.Float32x4.mul(
										SIMD.Float32x4.swizzle(i, 1, 1, 1, 1),
										o
									),
									SIMD.Float32x4.add(
										SIMD.Float32x4.mul(
											SIMD.Float32x4.swizzle(
												i,
												2,
												2,
												2,
												2
											),
											e
										),
										SIMD.Float32x4.mul(
											SIMD.Float32x4.swizzle(
												i,
												3,
												3,
												3,
												3
											),
											u
										)
									)
								)
							);
						SIMD.Float32x4.store(t, 0, l);
						var s = SIMD.Float32x4.load(r, 4),
							M = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(
									SIMD.Float32x4.swizzle(s, 0, 0, 0, 0),
									n
								),
								SIMD.Float32x4.add(
									SIMD.Float32x4.mul(
										SIMD.Float32x4.swizzle(s, 1, 1, 1, 1),
										o
									),
									SIMD.Float32x4.add(
										SIMD.Float32x4.mul(
											SIMD.Float32x4.swizzle(
												s,
												2,
												2,
												2,
												2
											),
											e
										),
										SIMD.Float32x4.mul(
											SIMD.Float32x4.swizzle(
												s,
												3,
												3,
												3,
												3
											),
											u
										)
									)
								)
							);
						SIMD.Float32x4.store(t, 4, M);
						var c = SIMD.Float32x4.load(r, 8),
							h = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(
									SIMD.Float32x4.swizzle(c, 0, 0, 0, 0),
									n
								),
								SIMD.Float32x4.add(
									SIMD.Float32x4.mul(
										SIMD.Float32x4.swizzle(c, 1, 1, 1, 1),
										o
									),
									SIMD.Float32x4.add(
										SIMD.Float32x4.mul(
											SIMD.Float32x4.swizzle(
												c,
												2,
												2,
												2,
												2
											),
											e
										),
										SIMD.Float32x4.mul(
											SIMD.Float32x4.swizzle(
												c,
												3,
												3,
												3,
												3
											),
											u
										)
									)
								)
							);
						SIMD.Float32x4.store(t, 8, h);
						var f = SIMD.Float32x4.load(r, 12),
							m = SIMD.Float32x4.add(
								SIMD.Float32x4.mul(
									SIMD.Float32x4.swizzle(f, 0, 0, 0, 0),
									n
								),
								SIMD.Float32x4.add(
									SIMD.Float32x4.mul(
										SIMD.Float32x4.swizzle(f, 1, 1, 1, 1),
										o
									),
									SIMD.Float32x4.add(
										SIMD.Float32x4.mul(
											SIMD.Float32x4.swizzle(
												f,
												2,
												2,
												2,
												2
											),
											e
										),
										SIMD.Float32x4.mul(
											SIMD.Float32x4.swizzle(
												f,
												3,
												3,
												3,
												3
											),
											u
										)
									)
								)
							);
						return SIMD.Float32x4.store(t, 12, m), t;
					}),
					(o.scalar.multiply = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = a[4],
							l = a[5],
							s = a[6],
							M = a[7],
							c = a[8],
							h = a[9],
							f = a[10],
							m = a[11],
							S = a[12],
							x = a[13],
							I = a[14],
							d = a[15],
							D = r[0],
							F = r[1],
							v = r[2],
							b = r[3];
						return (
							(t[0] = D * n + F * i + v * c + b * S),
							(t[1] = D * o + F * l + v * h + b * x),
							(t[2] = D * e + F * s + v * f + b * I),
							(t[3] = D * u + F * M + v * m + b * d),
							(D = r[4]),
							(F = r[5]),
							(v = r[6]),
							(b = r[7]),
							(t[4] = D * n + F * i + v * c + b * S),
							(t[5] = D * o + F * l + v * h + b * x),
							(t[6] = D * e + F * s + v * f + b * I),
							(t[7] = D * u + F * M + v * m + b * d),
							(D = r[8]),
							(F = r[9]),
							(v = r[10]),
							(b = r[11]),
							(t[8] = D * n + F * i + v * c + b * S),
							(t[9] = D * o + F * l + v * h + b * x),
							(t[10] = D * e + F * s + v * f + b * I),
							(t[11] = D * u + F * M + v * m + b * d),
							(D = r[12]),
							(F = r[13]),
							(v = r[14]),
							(b = r[15]),
							(t[12] = D * n + F * i + v * c + b * S),
							(t[13] = D * o + F * l + v * h + b * x),
							(t[14] = D * e + F * s + v * f + b * I),
							(t[15] = D * u + F * M + v * m + b * d),
							t
						);
					}),
					(o.multiply = n.USE_SIMD
						? o.SIMD.multiply
						: o.scalar.multiply),
					(o.mul = o.multiply),
					(o.scalar.translate = function(t, a, r) {
						var n,
							o,
							e,
							u,
							i,
							l,
							s,
							M,
							c,
							h,
							f,
							m,
							S = r[0],
							x = r[1],
							I = r[2];
						return (
							a === t
								? ((t[12] =
										a[0] * S + a[4] * x + a[8] * I + a[12]),
								  (t[13] =
										a[1] * S + a[5] * x + a[9] * I + a[13]),
								  (t[14] =
										a[2] * S +
										a[6] * x +
										a[10] * I +
										a[14]),
								  (t[15] =
										a[3] * S +
										a[7] * x +
										a[11] * I +
										a[15]))
								: ((n = a[0]),
								  (o = a[1]),
								  (e = a[2]),
								  (u = a[3]),
								  (i = a[4]),
								  (l = a[5]),
								  (s = a[6]),
								  (M = a[7]),
								  (c = a[8]),
								  (h = a[9]),
								  (f = a[10]),
								  (m = a[11]),
								  (t[0] = n),
								  (t[1] = o),
								  (t[2] = e),
								  (t[3] = u),
								  (t[4] = i),
								  (t[5] = l),
								  (t[6] = s),
								  (t[7] = M),
								  (t[8] = c),
								  (t[9] = h),
								  (t[10] = f),
								  (t[11] = m),
								  (t[12] = n * S + i * x + c * I + a[12]),
								  (t[13] = o * S + l * x + h * I + a[13]),
								  (t[14] = e * S + s * x + f * I + a[14]),
								  (t[15] = u * S + M * x + m * I + a[15])),
							t
						);
					}),
					(o.SIMD.translate = function(t, a, r) {
						var n = SIMD.Float32x4.load(a, 0),
							o = SIMD.Float32x4.load(a, 4),
							e = SIMD.Float32x4.load(a, 8),
							u = SIMD.Float32x4.load(a, 12),
							i = SIMD.Float32x4(r[0], r[1], r[2], 0);
						a !== t &&
							((t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = a[2]),
							(t[3] = a[3]),
							(t[4] = a[4]),
							(t[5] = a[5]),
							(t[6] = a[6]),
							(t[7] = a[7]),
							(t[8] = a[8]),
							(t[9] = a[9]),
							(t[10] = a[10]),
							(t[11] = a[11])),
							(n = SIMD.Float32x4.mul(
								n,
								SIMD.Float32x4.swizzle(i, 0, 0, 0, 0)
							)),
							(o = SIMD.Float32x4.mul(
								o,
								SIMD.Float32x4.swizzle(i, 1, 1, 1, 1)
							)),
							(e = SIMD.Float32x4.mul(
								e,
								SIMD.Float32x4.swizzle(i, 2, 2, 2, 2)
							));
						var l = SIMD.Float32x4.add(
							n,
							SIMD.Float32x4.add(o, SIMD.Float32x4.add(e, u))
						);
						return SIMD.Float32x4.store(t, 12, l), t;
					}),
					(o.translate = n.USE_SIMD
						? o.SIMD.translate
						: o.scalar.translate),
					(o.scalar.scale = function(t, a, r) {
						var n = r[0],
							o = r[1],
							e = r[2];
						return (
							(t[0] = a[0] * n),
							(t[1] = a[1] * n),
							(t[2] = a[2] * n),
							(t[3] = a[3] * n),
							(t[4] = a[4] * o),
							(t[5] = a[5] * o),
							(t[6] = a[6] * o),
							(t[7] = a[7] * o),
							(t[8] = a[8] * e),
							(t[9] = a[9] * e),
							(t[10] = a[10] * e),
							(t[11] = a[11] * e),
							(t[12] = a[12]),
							(t[13] = a[13]),
							(t[14] = a[14]),
							(t[15] = a[15]),
							t
						);
					}),
					(o.SIMD.scale = function(t, a, r) {
						var n,
							o,
							e,
							u = SIMD.Float32x4(r[0], r[1], r[2], 0);
						return (
							(n = SIMD.Float32x4.load(a, 0)),
							SIMD.Float32x4.store(
								t,
								0,
								SIMD.Float32x4.mul(
									n,
									SIMD.Float32x4.swizzle(u, 0, 0, 0, 0)
								)
							),
							(o = SIMD.Float32x4.load(a, 4)),
							SIMD.Float32x4.store(
								t,
								4,
								SIMD.Float32x4.mul(
									o,
									SIMD.Float32x4.swizzle(u, 1, 1, 1, 1)
								)
							),
							(e = SIMD.Float32x4.load(a, 8)),
							SIMD.Float32x4.store(
								t,
								8,
								SIMD.Float32x4.mul(
									e,
									SIMD.Float32x4.swizzle(u, 2, 2, 2, 2)
								)
							),
							(t[12] = a[12]),
							(t[13] = a[13]),
							(t[14] = a[14]),
							(t[15] = a[15]),
							t
						);
					}),
					(o.scale = n.USE_SIMD ? o.SIMD.scale : o.scalar.scale),
					(o.rotate = function(t, a, r, o) {
						var e,
							u,
							i,
							l,
							s,
							M,
							c,
							h,
							f,
							m,
							S,
							x,
							I,
							d,
							D,
							F,
							v,
							b,
							p,
							w,
							A,
							g,
							E,
							z,
							R = o[0],
							L = o[1],
							P = o[2],
							y = Math.sqrt(R * R + L * L + P * P);
						return Math.abs(y) < n.EPSILON
							? null
							: ((y = 1 / y),
							  (R *= y),
							  (L *= y),
							  (P *= y),
							  (e = Math.sin(r)),
							  (u = Math.cos(r)),
							  (i = 1 - u),
							  (l = a[0]),
							  (s = a[1]),
							  (M = a[2]),
							  (c = a[3]),
							  (h = a[4]),
							  (f = a[5]),
							  (m = a[6]),
							  (S = a[7]),
							  (x = a[8]),
							  (I = a[9]),
							  (d = a[10]),
							  (D = a[11]),
							  (F = R * R * i + u),
							  (v = L * R * i + P * e),
							  (b = P * R * i - L * e),
							  (p = R * L * i - P * e),
							  (w = L * L * i + u),
							  (A = P * L * i + R * e),
							  (g = R * P * i + L * e),
							  (E = L * P * i - R * e),
							  (z = P * P * i + u),
							  (t[0] = l * F + h * v + x * b),
							  (t[1] = s * F + f * v + I * b),
							  (t[2] = M * F + m * v + d * b),
							  (t[3] = c * F + S * v + D * b),
							  (t[4] = l * p + h * w + x * A),
							  (t[5] = s * p + f * w + I * A),
							  (t[6] = M * p + m * w + d * A),
							  (t[7] = c * p + S * w + D * A),
							  (t[8] = l * g + h * E + x * z),
							  (t[9] = s * g + f * E + I * z),
							  (t[10] = M * g + m * E + d * z),
							  (t[11] = c * g + S * E + D * z),
							  a !== t &&
									((t[12] = a[12]),
									(t[13] = a[13]),
									(t[14] = a[14]),
									(t[15] = a[15])),
							  t);
					}),
					(o.scalar.rotateX = function(t, a, r) {
						var n = Math.sin(r),
							o = Math.cos(r),
							e = a[4],
							u = a[5],
							i = a[6],
							l = a[7],
							s = a[8],
							M = a[9],
							c = a[10],
							h = a[11];
						return (
							a !== t &&
								((t[0] = a[0]),
								(t[1] = a[1]),
								(t[2] = a[2]),
								(t[3] = a[3]),
								(t[12] = a[12]),
								(t[13] = a[13]),
								(t[14] = a[14]),
								(t[15] = a[15])),
							(t[4] = e * o + s * n),
							(t[5] = u * o + M * n),
							(t[6] = i * o + c * n),
							(t[7] = l * o + h * n),
							(t[8] = s * o - e * n),
							(t[9] = M * o - u * n),
							(t[10] = c * o - i * n),
							(t[11] = h * o - l * n),
							t
						);
					}),
					(o.SIMD.rotateX = function(t, a, r) {
						var n = SIMD.Float32x4.splat(Math.sin(r)),
							o = SIMD.Float32x4.splat(Math.cos(r));
						a !== t &&
							((t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = a[2]),
							(t[3] = a[3]),
							(t[12] = a[12]),
							(t[13] = a[13]),
							(t[14] = a[14]),
							(t[15] = a[15]));
						var e = SIMD.Float32x4.load(a, 4),
							u = SIMD.Float32x4.load(a, 8);
						return (
							SIMD.Float32x4.store(
								t,
								4,
								SIMD.Float32x4.add(
									SIMD.Float32x4.mul(e, o),
									SIMD.Float32x4.mul(u, n)
								)
							),
							SIMD.Float32x4.store(
								t,
								8,
								SIMD.Float32x4.sub(
									SIMD.Float32x4.mul(u, o),
									SIMD.Float32x4.mul(e, n)
								)
							),
							t
						);
					}),
					(o.rotateX = n.USE_SIMD
						? o.SIMD.rotateX
						: o.scalar.rotateX),
					(o.scalar.rotateY = function(t, a, r) {
						var n = Math.sin(r),
							o = Math.cos(r),
							e = a[0],
							u = a[1],
							i = a[2],
							l = a[3],
							s = a[8],
							M = a[9],
							c = a[10],
							h = a[11];
						return (
							a !== t &&
								((t[4] = a[4]),
								(t[5] = a[5]),
								(t[6] = a[6]),
								(t[7] = a[7]),
								(t[12] = a[12]),
								(t[13] = a[13]),
								(t[14] = a[14]),
								(t[15] = a[15])),
							(t[0] = e * o - s * n),
							(t[1] = u * o - M * n),
							(t[2] = i * o - c * n),
							(t[3] = l * o - h * n),
							(t[8] = e * n + s * o),
							(t[9] = u * n + M * o),
							(t[10] = i * n + c * o),
							(t[11] = l * n + h * o),
							t
						);
					}),
					(o.SIMD.rotateY = function(t, a, r) {
						var n = SIMD.Float32x4.splat(Math.sin(r)),
							o = SIMD.Float32x4.splat(Math.cos(r));
						a !== t &&
							((t[4] = a[4]),
							(t[5] = a[5]),
							(t[6] = a[6]),
							(t[7] = a[7]),
							(t[12] = a[12]),
							(t[13] = a[13]),
							(t[14] = a[14]),
							(t[15] = a[15]));
						var e = SIMD.Float32x4.load(a, 0),
							u = SIMD.Float32x4.load(a, 8);
						return (
							SIMD.Float32x4.store(
								t,
								0,
								SIMD.Float32x4.sub(
									SIMD.Float32x4.mul(e, o),
									SIMD.Float32x4.mul(u, n)
								)
							),
							SIMD.Float32x4.store(
								t,
								8,
								SIMD.Float32x4.add(
									SIMD.Float32x4.mul(e, n),
									SIMD.Float32x4.mul(u, o)
								)
							),
							t
						);
					}),
					(o.rotateY = n.USE_SIMD
						? o.SIMD.rotateY
						: o.scalar.rotateY),
					(o.scalar.rotateZ = function(t, a, r) {
						var n = Math.sin(r),
							o = Math.cos(r),
							e = a[0],
							u = a[1],
							i = a[2],
							l = a[3],
							s = a[4],
							M = a[5],
							c = a[6],
							h = a[7];
						return (
							a !== t &&
								((t[8] = a[8]),
								(t[9] = a[9]),
								(t[10] = a[10]),
								(t[11] = a[11]),
								(t[12] = a[12]),
								(t[13] = a[13]),
								(t[14] = a[14]),
								(t[15] = a[15])),
							(t[0] = e * o + s * n),
							(t[1] = u * o + M * n),
							(t[2] = i * o + c * n),
							(t[3] = l * o + h * n),
							(t[4] = s * o - e * n),
							(t[5] = M * o - u * n),
							(t[6] = c * o - i * n),
							(t[7] = h * o - l * n),
							t
						);
					}),
					(o.SIMD.rotateZ = function(t, a, r) {
						var n = SIMD.Float32x4.splat(Math.sin(r)),
							o = SIMD.Float32x4.splat(Math.cos(r));
						a !== t &&
							((t[8] = a[8]),
							(t[9] = a[9]),
							(t[10] = a[10]),
							(t[11] = a[11]),
							(t[12] = a[12]),
							(t[13] = a[13]),
							(t[14] = a[14]),
							(t[15] = a[15]));
						var e = SIMD.Float32x4.load(a, 0),
							u = SIMD.Float32x4.load(a, 4);
						return (
							SIMD.Float32x4.store(
								t,
								0,
								SIMD.Float32x4.add(
									SIMD.Float32x4.mul(e, o),
									SIMD.Float32x4.mul(u, n)
								)
							),
							SIMD.Float32x4.store(
								t,
								4,
								SIMD.Float32x4.sub(
									SIMD.Float32x4.mul(u, o),
									SIMD.Float32x4.mul(e, n)
								)
							),
							t
						);
					}),
					(o.rotateZ = n.USE_SIMD
						? o.SIMD.rotateZ
						: o.scalar.rotateZ),
					(o.fromTranslation = function(t, a) {
						return (
							(t[0] = 1),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = 1),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 0),
							(t[9] = 0),
							(t[10] = 1),
							(t[11] = 0),
							(t[12] = a[0]),
							(t[13] = a[1]),
							(t[14] = a[2]),
							(t[15] = 1),
							t
						);
					}),
					(o.fromScaling = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = a[1]),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 0),
							(t[9] = 0),
							(t[10] = a[2]),
							(t[11] = 0),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = 0),
							(t[15] = 1),
							t
						);
					}),
					(o.fromRotation = function(t, a, r) {
						var o,
							e,
							u,
							i = r[0],
							l = r[1],
							s = r[2],
							M = Math.sqrt(i * i + l * l + s * s);
						return Math.abs(M) < n.EPSILON
							? null
							: ((M = 1 / M),
							  (i *= M),
							  (l *= M),
							  (s *= M),
							  (o = Math.sin(a)),
							  (e = Math.cos(a)),
							  (u = 1 - e),
							  (t[0] = i * i * u + e),
							  (t[1] = l * i * u + s * o),
							  (t[2] = s * i * u - l * o),
							  (t[3] = 0),
							  (t[4] = i * l * u - s * o),
							  (t[5] = l * l * u + e),
							  (t[6] = s * l * u + i * o),
							  (t[7] = 0),
							  (t[8] = i * s * u + l * o),
							  (t[9] = l * s * u - i * o),
							  (t[10] = s * s * u + e),
							  (t[11] = 0),
							  (t[12] = 0),
							  (t[13] = 0),
							  (t[14] = 0),
							  (t[15] = 1),
							  t);
					}),
					(o.fromXRotation = function(t, a) {
						var r = Math.sin(a),
							n = Math.cos(a);
						return (
							(t[0] = 1),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = n),
							(t[6] = r),
							(t[7] = 0),
							(t[8] = 0),
							(t[9] = -r),
							(t[10] = n),
							(t[11] = 0),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = 0),
							(t[15] = 1),
							t
						);
					}),
					(o.fromYRotation = function(t, a) {
						var r = Math.sin(a),
							n = Math.cos(a);
						return (
							(t[0] = n),
							(t[1] = 0),
							(t[2] = -r),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = 1),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = r),
							(t[9] = 0),
							(t[10] = n),
							(t[11] = 0),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = 0),
							(t[15] = 1),
							t
						);
					}),
					(o.fromZRotation = function(t, a) {
						var r = Math.sin(a),
							n = Math.cos(a);
						return (
							(t[0] = n),
							(t[1] = r),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = -r),
							(t[5] = n),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 0),
							(t[9] = 0),
							(t[10] = 1),
							(t[11] = 0),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = 0),
							(t[15] = 1),
							t
						);
					}),
					(o.fromRotationTranslation = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = n + n,
							l = o + o,
							s = e + e,
							M = n * i,
							c = n * l,
							h = n * s,
							f = o * l,
							m = o * s,
							S = e * s,
							x = u * i,
							I = u * l,
							d = u * s;
						return (
							(t[0] = 1 - (f + S)),
							(t[1] = c + d),
							(t[2] = h - I),
							(t[3] = 0),
							(t[4] = c - d),
							(t[5] = 1 - (M + S)),
							(t[6] = m + x),
							(t[7] = 0),
							(t[8] = h + I),
							(t[9] = m - x),
							(t[10] = 1 - (M + f)),
							(t[11] = 0),
							(t[12] = r[0]),
							(t[13] = r[1]),
							(t[14] = r[2]),
							(t[15] = 1),
							t
						);
					}),
					(o.getTranslation = function(t, a) {
						return (
							(t[0] = a[12]), (t[1] = a[13]), (t[2] = a[14]), t
						);
					}),
					(o.getRotation = function(t, a) {
						var r = a[0] + a[5] + a[10],
							n = 0;
						return (
							r > 0
								? ((n = 2 * Math.sqrt(r + 1)),
								  (t[3] = 0.25 * n),
								  (t[0] = (a[6] - a[9]) / n),
								  (t[1] = (a[8] - a[2]) / n),
								  (t[2] = (a[1] - a[4]) / n))
								: (a[0] > a[5]) & (a[0] > a[10])
								? ((n = 2 * Math.sqrt(1 + a[0] - a[5] - a[10])),
								  (t[3] = (a[6] - a[9]) / n),
								  (t[0] = 0.25 * n),
								  (t[1] = (a[1] + a[4]) / n),
								  (t[2] = (a[8] + a[2]) / n))
								: a[5] > a[10]
								? ((n = 2 * Math.sqrt(1 + a[5] - a[0] - a[10])),
								  (t[3] = (a[8] - a[2]) / n),
								  (t[0] = (a[1] + a[4]) / n),
								  (t[1] = 0.25 * n),
								  (t[2] = (a[6] + a[9]) / n))
								: ((n = 2 * Math.sqrt(1 + a[10] - a[0] - a[5])),
								  (t[3] = (a[1] - a[4]) / n),
								  (t[0] = (a[8] + a[2]) / n),
								  (t[1] = (a[6] + a[9]) / n),
								  (t[2] = 0.25 * n)),
							t
						);
					}),
					(o.fromRotationTranslationScale = function(t, a, r, n) {
						var o = a[0],
							e = a[1],
							u = a[2],
							i = a[3],
							l = o + o,
							s = e + e,
							M = u + u,
							c = o * l,
							h = o * s,
							f = o * M,
							m = e * s,
							S = e * M,
							x = u * M,
							I = i * l,
							d = i * s,
							D = i * M,
							F = n[0],
							v = n[1],
							b = n[2];
						return (
							(t[0] = (1 - (m + x)) * F),
							(t[1] = (h + D) * F),
							(t[2] = (f - d) * F),
							(t[3] = 0),
							(t[4] = (h - D) * v),
							(t[5] = (1 - (c + x)) * v),
							(t[6] = (S + I) * v),
							(t[7] = 0),
							(t[8] = (f + d) * b),
							(t[9] = (S - I) * b),
							(t[10] = (1 - (c + m)) * b),
							(t[11] = 0),
							(t[12] = r[0]),
							(t[13] = r[1]),
							(t[14] = r[2]),
							(t[15] = 1),
							t
						);
					}),
					(o.fromRotationTranslationScaleOrigin = function(
						t,
						a,
						r,
						n,
						o
					) {
						var e = a[0],
							u = a[1],
							i = a[2],
							l = a[3],
							s = e + e,
							M = u + u,
							c = i + i,
							h = e * s,
							f = e * M,
							m = e * c,
							S = u * M,
							x = u * c,
							I = i * c,
							d = l * s,
							D = l * M,
							F = l * c,
							v = n[0],
							b = n[1],
							p = n[2],
							w = o[0],
							A = o[1],
							g = o[2];
						return (
							(t[0] = (1 - (S + I)) * v),
							(t[1] = (f + F) * v),
							(t[2] = (m - D) * v),
							(t[3] = 0),
							(t[4] = (f - F) * b),
							(t[5] = (1 - (h + I)) * b),
							(t[6] = (x + d) * b),
							(t[7] = 0),
							(t[8] = (m + D) * p),
							(t[9] = (x - d) * p),
							(t[10] = (1 - (h + S)) * p),
							(t[11] = 0),
							(t[12] =
								r[0] + w - (t[0] * w + t[4] * A + t[8] * g)),
							(t[13] =
								r[1] + A - (t[1] * w + t[5] * A + t[9] * g)),
							(t[14] =
								r[2] + g - (t[2] * w + t[6] * A + t[10] * g)),
							(t[15] = 1),
							t
						);
					}),
					(o.fromQuat = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = r + r,
							i = n + n,
							l = o + o,
							s = r * u,
							M = n * u,
							c = n * i,
							h = o * u,
							f = o * i,
							m = o * l,
							S = e * u,
							x = e * i,
							I = e * l;
						return (
							(t[0] = 1 - c - m),
							(t[1] = M + I),
							(t[2] = h - x),
							(t[3] = 0),
							(t[4] = M - I),
							(t[5] = 1 - s - m),
							(t[6] = f + S),
							(t[7] = 0),
							(t[8] = h + x),
							(t[9] = f - S),
							(t[10] = 1 - s - c),
							(t[11] = 0),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = 0),
							(t[15] = 1),
							t
						);
					}),
					(o.frustum = function(t, a, r, n, o, e, u) {
						var i = 1 / (r - a),
							l = 1 / (o - n),
							s = 1 / (e - u);
						return (
							(t[0] = 2 * e * i),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = 2 * e * l),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = (r + a) * i),
							(t[9] = (o + n) * l),
							(t[10] = (u + e) * s),
							(t[11] = -1),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = u * e * 2 * s),
							(t[15] = 0),
							t
						);
					}),
					(o.perspective = function(t, a, r, n, o) {
						var e = 1 / Math.tan(a / 2),
							u = 1 / (n - o);
						return (
							(t[0] = e / r),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = e),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 0),
							(t[9] = 0),
							(t[10] = (o + n) * u),
							(t[11] = -1),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = 2 * o * n * u),
							(t[15] = 0),
							t
						);
					}),
					(o.perspectiveFromFieldOfView = function(t, a, r, n) {
						var o = Math.tan((a.upDegrees * Math.PI) / 180),
							e = Math.tan((a.downDegrees * Math.PI) / 180),
							u = Math.tan((a.leftDegrees * Math.PI) / 180),
							i = Math.tan((a.rightDegrees * Math.PI) / 180),
							l = 2 / (u + i),
							s = 2 / (o + e);
						return (
							(t[0] = l),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = s),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = -((u - i) * l * 0.5)),
							(t[9] = (o - e) * s * 0.5),
							(t[10] = n / (r - n)),
							(t[11] = -1),
							(t[12] = 0),
							(t[13] = 0),
							(t[14] = (n * r) / (r - n)),
							(t[15] = 0),
							t
						);
					}),
					(o.ortho = function(t, a, r, n, o, e, u) {
						var i = 1 / (a - r),
							l = 1 / (n - o),
							s = 1 / (e - u);
						return (
							(t[0] = -2 * i),
							(t[1] = 0),
							(t[2] = 0),
							(t[3] = 0),
							(t[4] = 0),
							(t[5] = -2 * l),
							(t[6] = 0),
							(t[7] = 0),
							(t[8] = 0),
							(t[9] = 0),
							(t[10] = 2 * s),
							(t[11] = 0),
							(t[12] = (a + r) * i),
							(t[13] = (o + n) * l),
							(t[14] = (u + e) * s),
							(t[15] = 1),
							t
						);
					}),
					(o.lookAt = function(t, a, r, e) {
						var u,
							i,
							l,
							s,
							M,
							c,
							h,
							f,
							m,
							S,
							x = a[0],
							I = a[1],
							d = a[2],
							D = e[0],
							F = e[1],
							v = e[2],
							b = r[0],
							p = r[1],
							w = r[2];
						return Math.abs(x - b) < n.EPSILON &&
							Math.abs(I - p) < n.EPSILON &&
							Math.abs(d - w) < n.EPSILON
							? o.identity(t)
							: ((h = x - b),
							  (f = I - p),
							  (m = d - w),
							  (S = 1 / Math.sqrt(h * h + f * f + m * m)),
							  (h *= S),
							  (f *= S),
							  (m *= S),
							  (u = F * m - v * f),
							  (i = v * h - D * m),
							  (l = D * f - F * h),
							  (S = Math.sqrt(u * u + i * i + l * l)),
							  S
									? ((S = 1 / S),
									  (u *= S),
									  (i *= S),
									  (l *= S))
									: ((u = 0), (i = 0), (l = 0)),
							  (s = f * l - m * i),
							  (M = m * u - h * l),
							  (c = h * i - f * u),
							  (S = Math.sqrt(s * s + M * M + c * c)),
							  S
									? ((S = 1 / S),
									  (s *= S),
									  (M *= S),
									  (c *= S))
									: ((s = 0), (M = 0), (c = 0)),
							  (t[0] = u),
							  (t[1] = s),
							  (t[2] = h),
							  (t[3] = 0),
							  (t[4] = i),
							  (t[5] = M),
							  (t[6] = f),
							  (t[7] = 0),
							  (t[8] = l),
							  (t[9] = c),
							  (t[10] = m),
							  (t[11] = 0),
							  (t[12] = -(u * x + i * I + l * d)),
							  (t[13] = -(s * x + M * I + c * d)),
							  (t[14] = -(h * x + f * I + m * d)),
							  (t[15] = 1),
							  t);
					}),
					(o.str = function(t) {
						return (
							"mat4(" +
							t[0] +
							", " +
							t[1] +
							", " +
							t[2] +
							", " +
							t[3] +
							", " +
							t[4] +
							", " +
							t[5] +
							", " +
							t[6] +
							", " +
							t[7] +
							", " +
							t[8] +
							", " +
							t[9] +
							", " +
							t[10] +
							", " +
							t[11] +
							", " +
							t[12] +
							", " +
							t[13] +
							", " +
							t[14] +
							", " +
							t[15] +
							")"
						);
					}),
					(o.frob = function(t) {
						return Math.sqrt(
							Math.pow(t[0], 2) +
								Math.pow(t[1], 2) +
								Math.pow(t[2], 2) +
								Math.pow(t[3], 2) +
								Math.pow(t[4], 2) +
								Math.pow(t[5], 2) +
								Math.pow(t[6], 2) +
								Math.pow(t[7], 2) +
								Math.pow(t[8], 2) +
								Math.pow(t[9], 2) +
								Math.pow(t[10], 2) +
								Math.pow(t[11], 2) +
								Math.pow(t[12], 2) +
								Math.pow(t[13], 2) +
								Math.pow(t[14], 2) +
								Math.pow(t[15], 2)
						);
					}),
					(o.add = function(t, a, r) {
						return (
							(t[0] = a[0] + r[0]),
							(t[1] = a[1] + r[1]),
							(t[2] = a[2] + r[2]),
							(t[3] = a[3] + r[3]),
							(t[4] = a[4] + r[4]),
							(t[5] = a[5] + r[5]),
							(t[6] = a[6] + r[6]),
							(t[7] = a[7] + r[7]),
							(t[8] = a[8] + r[8]),
							(t[9] = a[9] + r[9]),
							(t[10] = a[10] + r[10]),
							(t[11] = a[11] + r[11]),
							(t[12] = a[12] + r[12]),
							(t[13] = a[13] + r[13]),
							(t[14] = a[14] + r[14]),
							(t[15] = a[15] + r[15]),
							t
						);
					}),
					(o.subtract = function(t, a, r) {
						return (
							(t[0] = a[0] - r[0]),
							(t[1] = a[1] - r[1]),
							(t[2] = a[2] - r[2]),
							(t[3] = a[3] - r[3]),
							(t[4] = a[4] - r[4]),
							(t[5] = a[5] - r[5]),
							(t[6] = a[6] - r[6]),
							(t[7] = a[7] - r[7]),
							(t[8] = a[8] - r[8]),
							(t[9] = a[9] - r[9]),
							(t[10] = a[10] - r[10]),
							(t[11] = a[11] - r[11]),
							(t[12] = a[12] - r[12]),
							(t[13] = a[13] - r[13]),
							(t[14] = a[14] - r[14]),
							(t[15] = a[15] - r[15]),
							t
						);
					}),
					(o.sub = o.subtract),
					(o.multiplyScalar = function(t, a, r) {
						return (
							(t[0] = a[0] * r),
							(t[1] = a[1] * r),
							(t[2] = a[2] * r),
							(t[3] = a[3] * r),
							(t[4] = a[4] * r),
							(t[5] = a[5] * r),
							(t[6] = a[6] * r),
							(t[7] = a[7] * r),
							(t[8] = a[8] * r),
							(t[9] = a[9] * r),
							(t[10] = a[10] * r),
							(t[11] = a[11] * r),
							(t[12] = a[12] * r),
							(t[13] = a[13] * r),
							(t[14] = a[14] * r),
							(t[15] = a[15] * r),
							t
						);
					}),
					(o.multiplyScalarAndAdd = function(t, a, r, n) {
						return (
							(t[0] = a[0] + r[0] * n),
							(t[1] = a[1] + r[1] * n),
							(t[2] = a[2] + r[2] * n),
							(t[3] = a[3] + r[3] * n),
							(t[4] = a[4] + r[4] * n),
							(t[5] = a[5] + r[5] * n),
							(t[6] = a[6] + r[6] * n),
							(t[7] = a[7] + r[7] * n),
							(t[8] = a[8] + r[8] * n),
							(t[9] = a[9] + r[9] * n),
							(t[10] = a[10] + r[10] * n),
							(t[11] = a[11] + r[11] * n),
							(t[12] = a[12] + r[12] * n),
							(t[13] = a[13] + r[13] * n),
							(t[14] = a[14] + r[14] * n),
							(t[15] = a[15] + r[15] * n),
							t
						);
					}),
					(o.exactEquals = function(t, a) {
						return (
							t[0] === a[0] &&
							t[1] === a[1] &&
							t[2] === a[2] &&
							t[3] === a[3] &&
							t[4] === a[4] &&
							t[5] === a[5] &&
							t[6] === a[6] &&
							t[7] === a[7] &&
							t[8] === a[8] &&
							t[9] === a[9] &&
							t[10] === a[10] &&
							t[11] === a[11] &&
							t[12] === a[12] &&
							t[13] === a[13] &&
							t[14] === a[14] &&
							t[15] === a[15]
						);
					}),
					(o.equals = function(t, a) {
						var r = t[0],
							o = t[1],
							e = t[2],
							u = t[3],
							i = t[4],
							l = t[5],
							s = t[6],
							M = t[7],
							c = t[8],
							h = t[9],
							f = t[10],
							m = t[11],
							S = t[12],
							x = t[13],
							I = t[14],
							d = t[15],
							D = a[0],
							F = a[1],
							v = a[2],
							b = a[3],
							p = a[4],
							w = a[5],
							A = a[6],
							g = a[7],
							E = a[8],
							z = a[9],
							R = a[10],
							L = a[11],
							P = a[12],
							y = a[13],
							q = a[14],
							T = a[15];
						return (
							Math.abs(r - D) <=
								n.EPSILON *
									Math.max(1, Math.abs(r), Math.abs(D)) &&
							Math.abs(o - F) <=
								n.EPSILON *
									Math.max(1, Math.abs(o), Math.abs(F)) &&
							Math.abs(e - v) <=
								n.EPSILON *
									Math.max(1, Math.abs(e), Math.abs(v)) &&
							Math.abs(u - b) <=
								n.EPSILON *
									Math.max(1, Math.abs(u), Math.abs(b)) &&
							Math.abs(i - p) <=
								n.EPSILON *
									Math.max(1, Math.abs(i), Math.abs(p)) &&
							Math.abs(l - w) <=
								n.EPSILON *
									Math.max(1, Math.abs(l), Math.abs(w)) &&
							Math.abs(s - A) <=
								n.EPSILON *
									Math.max(1, Math.abs(s), Math.abs(A)) &&
							Math.abs(M - g) <=
								n.EPSILON *
									Math.max(1, Math.abs(M), Math.abs(g)) &&
							Math.abs(c - E) <=
								n.EPSILON *
									Math.max(1, Math.abs(c), Math.abs(E)) &&
							Math.abs(h - z) <=
								n.EPSILON *
									Math.max(1, Math.abs(h), Math.abs(z)) &&
							Math.abs(f - R) <=
								n.EPSILON *
									Math.max(1, Math.abs(f), Math.abs(R)) &&
							Math.abs(m - L) <=
								n.EPSILON *
									Math.max(1, Math.abs(m), Math.abs(L)) &&
							Math.abs(S - P) <=
								n.EPSILON *
									Math.max(1, Math.abs(S), Math.abs(P)) &&
							Math.abs(x - y) <=
								n.EPSILON *
									Math.max(1, Math.abs(x), Math.abs(y)) &&
							Math.abs(I - q) <=
								n.EPSILON *
									Math.max(1, Math.abs(I), Math.abs(q)) &&
							Math.abs(d - T) <=
								n.EPSILON *
									Math.max(1, Math.abs(d), Math.abs(T))
						);
					}),
					(t.exports = o);
			},
			function(t, a, r) {
				var n = r(1),
					o = r(4),
					e = r(7),
					u = r(8),
					i = {};
				(i.create = function() {
					var t = new n.ARRAY_TYPE(4);
					return (t[0] = 0), (t[1] = 0), (t[2] = 0), (t[3] = 1), t;
				}),
					(i.rotationTo = (function() {
						var t = e.create(),
							a = e.fromValues(1, 0, 0),
							r = e.fromValues(0, 1, 0);
						return function(n, o, u) {
							var l = e.dot(o, u);
							return -0.999999 > l
								? (e.cross(t, a, o),
								  e.length(t) < 1e-6 && e.cross(t, r, o),
								  e.normalize(t, t),
								  i.setAxisAngle(n, t, Math.PI),
								  n)
								: l > 0.999999
								? ((n[0] = 0),
								  (n[1] = 0),
								  (n[2] = 0),
								  (n[3] = 1),
								  n)
								: (e.cross(t, o, u),
								  (n[0] = t[0]),
								  (n[1] = t[1]),
								  (n[2] = t[2]),
								  (n[3] = 1 + l),
								  i.normalize(n, n));
						};
					})()),
					(i.setAxes = (function() {
						var t = o.create();
						return function(a, r, n, o) {
							return (
								(t[0] = n[0]),
								(t[3] = n[1]),
								(t[6] = n[2]),
								(t[1] = o[0]),
								(t[4] = o[1]),
								(t[7] = o[2]),
								(t[2] = -r[0]),
								(t[5] = -r[1]),
								(t[8] = -r[2]),
								i.normalize(a, i.fromMat3(a, t))
							);
						};
					})()),
					(i.clone = u.clone),
					(i.fromValues = u.fromValues),
					(i.copy = u.copy),
					(i.set = u.set),
					(i.identity = function(t) {
						return (
							(t[0] = 0), (t[1] = 0), (t[2] = 0), (t[3] = 1), t
						);
					}),
					(i.setAxisAngle = function(t, a, r) {
						r = 0.5 * r;
						var n = Math.sin(r);
						return (
							(t[0] = n * a[0]),
							(t[1] = n * a[1]),
							(t[2] = n * a[2]),
							(t[3] = Math.cos(r)),
							t
						);
					}),
					(i.getAxisAngle = function(t, a) {
						var r = 2 * Math.acos(a[3]),
							n = Math.sin(r / 2);
						return (
							0 != n
								? ((t[0] = a[0] / n),
								  (t[1] = a[1] / n),
								  (t[2] = a[2] / n))
								: ((t[0] = 1), (t[1] = 0), (t[2] = 0)),
							r
						);
					}),
					(i.add = u.add),
					(i.multiply = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = r[0],
							l = r[1],
							s = r[2],
							M = r[3];
						return (
							(t[0] = n * M + u * i + o * s - e * l),
							(t[1] = o * M + u * l + e * i - n * s),
							(t[2] = e * M + u * s + n * l - o * i),
							(t[3] = u * M - n * i - o * l - e * s),
							t
						);
					}),
					(i.mul = i.multiply),
					(i.scale = u.scale),
					(i.rotateX = function(t, a, r) {
						r *= 0.5;
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = Math.sin(r),
							l = Math.cos(r);
						return (
							(t[0] = n * l + u * i),
							(t[1] = o * l + e * i),
							(t[2] = e * l - o * i),
							(t[3] = u * l - n * i),
							t
						);
					}),
					(i.rotateY = function(t, a, r) {
						r *= 0.5;
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = Math.sin(r),
							l = Math.cos(r);
						return (
							(t[0] = n * l - e * i),
							(t[1] = o * l + u * i),
							(t[2] = e * l + n * i),
							(t[3] = u * l - o * i),
							t
						);
					}),
					(i.rotateZ = function(t, a, r) {
						r *= 0.5;
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3],
							i = Math.sin(r),
							l = Math.cos(r);
						return (
							(t[0] = n * l + o * i),
							(t[1] = o * l - n * i),
							(t[2] = e * l + u * i),
							(t[3] = u * l - e * i),
							t
						);
					}),
					(i.calculateW = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2];
						return (
							(t[0] = r),
							(t[1] = n),
							(t[2] = o),
							(t[3] = Math.sqrt(
								Math.abs(1 - r * r - n * n - o * o)
							)),
							t
						);
					}),
					(i.dot = u.dot),
					(i.lerp = u.lerp),
					(i.slerp = function(t, a, r, n) {
						var o,
							e,
							u,
							i,
							l,
							s = a[0],
							M = a[1],
							c = a[2],
							h = a[3],
							f = r[0],
							m = r[1],
							S = r[2],
							x = r[3];
						return (
							(e = s * f + M * m + c * S + h * x),
							0 > e &&
								((e = -e),
								(f = -f),
								(m = -m),
								(S = -S),
								(x = -x)),
							1 - e > 1e-6
								? ((o = Math.acos(e)),
								  (u = Math.sin(o)),
								  (i = Math.sin((1 - n) * o) / u),
								  (l = Math.sin(n * o) / u))
								: ((i = 1 - n), (l = n)),
							(t[0] = i * s + l * f),
							(t[1] = i * M + l * m),
							(t[2] = i * c + l * S),
							(t[3] = i * h + l * x),
							t
						);
					}),
					(i.sqlerp = (function() {
						var t = i.create(),
							a = i.create();
						return function(r, n, o, e, u, l) {
							return (
								i.slerp(t, n, u, l),
								i.slerp(a, o, e, l),
								i.slerp(r, t, a, 2 * l * (1 - l)),
								r
							);
						};
					})()),
					(i.invert = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = r * r + n * n + o * o + e * e,
							i = u ? 1 / u : 0;
						return (
							(t[0] = -r * i),
							(t[1] = -n * i),
							(t[2] = -o * i),
							(t[3] = e * i),
							t
						);
					}),
					(i.conjugate = function(t, a) {
						return (
							(t[0] = -a[0]),
							(t[1] = -a[1]),
							(t[2] = -a[2]),
							(t[3] = a[3]),
							t
						);
					}),
					(i.length = u.length),
					(i.len = i.length),
					(i.squaredLength = u.squaredLength),
					(i.sqrLen = i.squaredLength),
					(i.normalize = u.normalize),
					(i.fromMat3 = function(t, a) {
						var r,
							n = a[0] + a[4] + a[8];
						if (n > 0)
							(r = Math.sqrt(n + 1)),
								(t[3] = 0.5 * r),
								(r = 0.5 / r),
								(t[0] = (a[5] - a[7]) * r),
								(t[1] = (a[6] - a[2]) * r),
								(t[2] = (a[1] - a[3]) * r);
						else {
							var o = 0;
							a[4] > a[0] && (o = 1),
								a[8] > a[3 * o + o] && (o = 2);
							var e = (o + 1) % 3,
								u = (o + 2) % 3;
							(r = Math.sqrt(
								a[3 * o + o] - a[3 * e + e] - a[3 * u + u] + 1
							)),
								(t[o] = 0.5 * r),
								(r = 0.5 / r),
								(t[3] = (a[3 * e + u] - a[3 * u + e]) * r),
								(t[e] = (a[3 * e + o] + a[3 * o + e]) * r),
								(t[u] = (a[3 * u + o] + a[3 * o + u]) * r);
						}
						return t;
					}),
					(i.str = function(t) {
						return (
							"quat(" +
							t[0] +
							", " +
							t[1] +
							", " +
							t[2] +
							", " +
							t[3] +
							")"
						);
					}),
					(i.exactEquals = u.exactEquals),
					(i.equals = u.equals),
					(t.exports = i);
			},
			function(t, a, r) {
				var n = r(1),
					o = {};
				(o.create = function() {
					var t = new n.ARRAY_TYPE(3);
					return (t[0] = 0), (t[1] = 0), (t[2] = 0), t;
				}),
					(o.clone = function(t) {
						var a = new n.ARRAY_TYPE(3);
						return (a[0] = t[0]), (a[1] = t[1]), (a[2] = t[2]), a;
					}),
					(o.fromValues = function(t, a, r) {
						var o = new n.ARRAY_TYPE(3);
						return (o[0] = t), (o[1] = a), (o[2] = r), o;
					}),
					(o.copy = function(t, a) {
						return (t[0] = a[0]), (t[1] = a[1]), (t[2] = a[2]), t;
					}),
					(o.set = function(t, a, r, n) {
						return (t[0] = a), (t[1] = r), (t[2] = n), t;
					}),
					(o.add = function(t, a, r) {
						return (
							(t[0] = a[0] + r[0]),
							(t[1] = a[1] + r[1]),
							(t[2] = a[2] + r[2]),
							t
						);
					}),
					(o.subtract = function(t, a, r) {
						return (
							(t[0] = a[0] - r[0]),
							(t[1] = a[1] - r[1]),
							(t[2] = a[2] - r[2]),
							t
						);
					}),
					(o.sub = o.subtract),
					(o.multiply = function(t, a, r) {
						return (
							(t[0] = a[0] * r[0]),
							(t[1] = a[1] * r[1]),
							(t[2] = a[2] * r[2]),
							t
						);
					}),
					(o.mul = o.multiply),
					(o.divide = function(t, a, r) {
						return (
							(t[0] = a[0] / r[0]),
							(t[1] = a[1] / r[1]),
							(t[2] = a[2] / r[2]),
							t
						);
					}),
					(o.div = o.divide),
					(o.ceil = function(t, a) {
						return (
							(t[0] = Math.ceil(a[0])),
							(t[1] = Math.ceil(a[1])),
							(t[2] = Math.ceil(a[2])),
							t
						);
					}),
					(o.floor = function(t, a) {
						return (
							(t[0] = Math.floor(a[0])),
							(t[1] = Math.floor(a[1])),
							(t[2] = Math.floor(a[2])),
							t
						);
					}),
					(o.min = function(t, a, r) {
						return (
							(t[0] = Math.min(a[0], r[0])),
							(t[1] = Math.min(a[1], r[1])),
							(t[2] = Math.min(a[2], r[2])),
							t
						);
					}),
					(o.max = function(t, a, r) {
						return (
							(t[0] = Math.max(a[0], r[0])),
							(t[1] = Math.max(a[1], r[1])),
							(t[2] = Math.max(a[2], r[2])),
							t
						);
					}),
					(o.round = function(t, a) {
						return (
							(t[0] = Math.round(a[0])),
							(t[1] = Math.round(a[1])),
							(t[2] = Math.round(a[2])),
							t
						);
					}),
					(o.scale = function(t, a, r) {
						return (
							(t[0] = a[0] * r),
							(t[1] = a[1] * r),
							(t[2] = a[2] * r),
							t
						);
					}),
					(o.scaleAndAdd = function(t, a, r, n) {
						return (
							(t[0] = a[0] + r[0] * n),
							(t[1] = a[1] + r[1] * n),
							(t[2] = a[2] + r[2] * n),
							t
						);
					}),
					(o.distance = function(t, a) {
						var r = a[0] - t[0],
							n = a[1] - t[1],
							o = a[2] - t[2];
						return Math.sqrt(r * r + n * n + o * o);
					}),
					(o.dist = o.distance),
					(o.squaredDistance = function(t, a) {
						var r = a[0] - t[0],
							n = a[1] - t[1],
							o = a[2] - t[2];
						return r * r + n * n + o * o;
					}),
					(o.sqrDist = o.squaredDistance),
					(o.length = function(t) {
						var a = t[0],
							r = t[1],
							n = t[2];
						return Math.sqrt(a * a + r * r + n * n);
					}),
					(o.len = o.length),
					(o.squaredLength = function(t) {
						var a = t[0],
							r = t[1],
							n = t[2];
						return a * a + r * r + n * n;
					}),
					(o.sqrLen = o.squaredLength),
					(o.negate = function(t, a) {
						return (
							(t[0] = -a[0]), (t[1] = -a[1]), (t[2] = -a[2]), t
						);
					}),
					(o.inverse = function(t, a) {
						return (
							(t[0] = 1 / a[0]),
							(t[1] = 1 / a[1]),
							(t[2] = 1 / a[2]),
							t
						);
					}),
					(o.normalize = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = r * r + n * n + o * o;
						return (
							e > 0 &&
								((e = 1 / Math.sqrt(e)),
								(t[0] = a[0] * e),
								(t[1] = a[1] * e),
								(t[2] = a[2] * e)),
							t
						);
					}),
					(o.dot = function(t, a) {
						return t[0] * a[0] + t[1] * a[1] + t[2] * a[2];
					}),
					(o.cross = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = r[0],
							i = r[1],
							l = r[2];
						return (
							(t[0] = o * l - e * i),
							(t[1] = e * u - n * l),
							(t[2] = n * i - o * u),
							t
						);
					}),
					(o.lerp = function(t, a, r, n) {
						var o = a[0],
							e = a[1],
							u = a[2];
						return (
							(t[0] = o + n * (r[0] - o)),
							(t[1] = e + n * (r[1] - e)),
							(t[2] = u + n * (r[2] - u)),
							t
						);
					}),
					(o.hermite = function(t, a, r, n, o, e) {
						var u = e * e,
							i = u * (2 * e - 3) + 1,
							l = u * (e - 2) + e,
							s = u * (e - 1),
							M = u * (3 - 2 * e);
						return (
							(t[0] = a[0] * i + r[0] * l + n[0] * s + o[0] * M),
							(t[1] = a[1] * i + r[1] * l + n[1] * s + o[1] * M),
							(t[2] = a[2] * i + r[2] * l + n[2] * s + o[2] * M),
							t
						);
					}),
					(o.bezier = function(t, a, r, n, o, e) {
						var u = 1 - e,
							i = u * u,
							l = e * e,
							s = i * u,
							M = 3 * e * i,
							c = 3 * l * u,
							h = l * e;
						return (
							(t[0] = a[0] * s + r[0] * M + n[0] * c + o[0] * h),
							(t[1] = a[1] * s + r[1] * M + n[1] * c + o[1] * h),
							(t[2] = a[2] * s + r[2] * M + n[2] * c + o[2] * h),
							t
						);
					}),
					(o.random = function(t, a) {
						a = a || 1;
						var r = 2 * n.RANDOM() * Math.PI,
							o = 2 * n.RANDOM() - 1,
							e = Math.sqrt(1 - o * o) * a;
						return (
							(t[0] = Math.cos(r) * e),
							(t[1] = Math.sin(r) * e),
							(t[2] = o * a),
							t
						);
					}),
					(o.transformMat4 = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = r[3] * n + r[7] * o + r[11] * e + r[15];
						return (
							(u = u || 1),
							(t[0] =
								(r[0] * n + r[4] * o + r[8] * e + r[12]) / u),
							(t[1] =
								(r[1] * n + r[5] * o + r[9] * e + r[13]) / u),
							(t[2] =
								(r[2] * n + r[6] * o + r[10] * e + r[14]) / u),
							t
						);
					}),
					(o.transformMat3 = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2];
						return (
							(t[0] = n * r[0] + o * r[3] + e * r[6]),
							(t[1] = n * r[1] + o * r[4] + e * r[7]),
							(t[2] = n * r[2] + o * r[5] + e * r[8]),
							t
						);
					}),
					(o.transformQuat = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = r[0],
							i = r[1],
							l = r[2],
							s = r[3],
							M = s * n + i * e - l * o,
							c = s * o + l * n - u * e,
							h = s * e + u * o - i * n,
							f = -u * n - i * o - l * e;
						return (
							(t[0] = M * s + f * -u + c * -l - h * -i),
							(t[1] = c * s + f * -i + h * -u - M * -l),
							(t[2] = h * s + f * -l + M * -i - c * -u),
							t
						);
					}),
					(o.rotateX = function(t, a, r, n) {
						var o = [],
							e = [];
						return (
							(o[0] = a[0] - r[0]),
							(o[1] = a[1] - r[1]),
							(o[2] = a[2] - r[2]),
							(e[0] = o[0]),
							(e[1] = o[1] * Math.cos(n) - o[2] * Math.sin(n)),
							(e[2] = o[1] * Math.sin(n) + o[2] * Math.cos(n)),
							(t[0] = e[0] + r[0]),
							(t[1] = e[1] + r[1]),
							(t[2] = e[2] + r[2]),
							t
						);
					}),
					(o.rotateY = function(t, a, r, n) {
						var o = [],
							e = [];
						return (
							(o[0] = a[0] - r[0]),
							(o[1] = a[1] - r[1]),
							(o[2] = a[2] - r[2]),
							(e[0] = o[2] * Math.sin(n) + o[0] * Math.cos(n)),
							(e[1] = o[1]),
							(e[2] = o[2] * Math.cos(n) - o[0] * Math.sin(n)),
							(t[0] = e[0] + r[0]),
							(t[1] = e[1] + r[1]),
							(t[2] = e[2] + r[2]),
							t
						);
					}),
					(o.rotateZ = function(t, a, r, n) {
						var o = [],
							e = [];
						return (
							(o[0] = a[0] - r[0]),
							(o[1] = a[1] - r[1]),
							(o[2] = a[2] - r[2]),
							(e[0] = o[0] * Math.cos(n) - o[1] * Math.sin(n)),
							(e[1] = o[0] * Math.sin(n) + o[1] * Math.cos(n)),
							(e[2] = o[2]),
							(t[0] = e[0] + r[0]),
							(t[1] = e[1] + r[1]),
							(t[2] = e[2] + r[2]),
							t
						);
					}),
					(o.forEach = (function() {
						var t = o.create();
						return function(a, r, n, o, e, u) {
							var i, l;
							for (
								r || (r = 3),
									n || (n = 0),
									l = o
										? Math.min(o * r + n, a.length)
										: a.length,
									i = n;
								l > i;
								i += r
							)
								(t[0] = a[i]),
									(t[1] = a[i + 1]),
									(t[2] = a[i + 2]),
									e(t, t, u),
									(a[i] = t[0]),
									(a[i + 1] = t[1]),
									(a[i + 2] = t[2]);
							return a;
						};
					})()),
					(o.angle = function(t, a) {
						var r = o.fromValues(t[0], t[1], t[2]),
							n = o.fromValues(a[0], a[1], a[2]);
						o.normalize(r, r), o.normalize(n, n);
						var e = o.dot(r, n);
						return e > 1 ? 0 : Math.acos(e);
					}),
					(o.str = function(t) {
						return "vec3(" + t[0] + ", " + t[1] + ", " + t[2] + ")";
					}),
					(o.exactEquals = function(t, a) {
						return t[0] === a[0] && t[1] === a[1] && t[2] === a[2];
					}),
					(o.equals = function(t, a) {
						var r = t[0],
							o = t[1],
							e = t[2],
							u = a[0],
							i = a[1],
							l = a[2];
						return (
							Math.abs(r - u) <=
								n.EPSILON *
									Math.max(1, Math.abs(r), Math.abs(u)) &&
							Math.abs(o - i) <=
								n.EPSILON *
									Math.max(1, Math.abs(o), Math.abs(i)) &&
							Math.abs(e - l) <=
								n.EPSILON *
									Math.max(1, Math.abs(e), Math.abs(l))
						);
					}),
					(t.exports = o);
			},
			function(t, a, r) {
				var n = r(1),
					o = {};
				(o.create = function() {
					var t = new n.ARRAY_TYPE(4);
					return (t[0] = 0), (t[1] = 0), (t[2] = 0), (t[3] = 0), t;
				}),
					(o.clone = function(t) {
						var a = new n.ARRAY_TYPE(4);
						return (
							(a[0] = t[0]),
							(a[1] = t[1]),
							(a[2] = t[2]),
							(a[3] = t[3]),
							a
						);
					}),
					(o.fromValues = function(t, a, r, o) {
						var e = new n.ARRAY_TYPE(4);
						return (
							(e[0] = t), (e[1] = a), (e[2] = r), (e[3] = o), e
						);
					}),
					(o.copy = function(t, a) {
						return (
							(t[0] = a[0]),
							(t[1] = a[1]),
							(t[2] = a[2]),
							(t[3] = a[3]),
							t
						);
					}),
					(o.set = function(t, a, r, n, o) {
						return (
							(t[0] = a), (t[1] = r), (t[2] = n), (t[3] = o), t
						);
					}),
					(o.add = function(t, a, r) {
						return (
							(t[0] = a[0] + r[0]),
							(t[1] = a[1] + r[1]),
							(t[2] = a[2] + r[2]),
							(t[3] = a[3] + r[3]),
							t
						);
					}),
					(o.subtract = function(t, a, r) {
						return (
							(t[0] = a[0] - r[0]),
							(t[1] = a[1] - r[1]),
							(t[2] = a[2] - r[2]),
							(t[3] = a[3] - r[3]),
							t
						);
					}),
					(o.sub = o.subtract),
					(o.multiply = function(t, a, r) {
						return (
							(t[0] = a[0] * r[0]),
							(t[1] = a[1] * r[1]),
							(t[2] = a[2] * r[2]),
							(t[3] = a[3] * r[3]),
							t
						);
					}),
					(o.mul = o.multiply),
					(o.divide = function(t, a, r) {
						return (
							(t[0] = a[0] / r[0]),
							(t[1] = a[1] / r[1]),
							(t[2] = a[2] / r[2]),
							(t[3] = a[3] / r[3]),
							t
						);
					}),
					(o.div = o.divide),
					(o.ceil = function(t, a) {
						return (
							(t[0] = Math.ceil(a[0])),
							(t[1] = Math.ceil(a[1])),
							(t[2] = Math.ceil(a[2])),
							(t[3] = Math.ceil(a[3])),
							t
						);
					}),
					(o.floor = function(t, a) {
						return (
							(t[0] = Math.floor(a[0])),
							(t[1] = Math.floor(a[1])),
							(t[2] = Math.floor(a[2])),
							(t[3] = Math.floor(a[3])),
							t
						);
					}),
					(o.min = function(t, a, r) {
						return (
							(t[0] = Math.min(a[0], r[0])),
							(t[1] = Math.min(a[1], r[1])),
							(t[2] = Math.min(a[2], r[2])),
							(t[3] = Math.min(a[3], r[3])),
							t
						);
					}),
					(o.max = function(t, a, r) {
						return (
							(t[0] = Math.max(a[0], r[0])),
							(t[1] = Math.max(a[1], r[1])),
							(t[2] = Math.max(a[2], r[2])),
							(t[3] = Math.max(a[3], r[3])),
							t
						);
					}),
					(o.round = function(t, a) {
						return (
							(t[0] = Math.round(a[0])),
							(t[1] = Math.round(a[1])),
							(t[2] = Math.round(a[2])),
							(t[3] = Math.round(a[3])),
							t
						);
					}),
					(o.scale = function(t, a, r) {
						return (
							(t[0] = a[0] * r),
							(t[1] = a[1] * r),
							(t[2] = a[2] * r),
							(t[3] = a[3] * r),
							t
						);
					}),
					(o.scaleAndAdd = function(t, a, r, n) {
						return (
							(t[0] = a[0] + r[0] * n),
							(t[1] = a[1] + r[1] * n),
							(t[2] = a[2] + r[2] * n),
							(t[3] = a[3] + r[3] * n),
							t
						);
					}),
					(o.distance = function(t, a) {
						var r = a[0] - t[0],
							n = a[1] - t[1],
							o = a[2] - t[2],
							e = a[3] - t[3];
						return Math.sqrt(r * r + n * n + o * o + e * e);
					}),
					(o.dist = o.distance),
					(o.squaredDistance = function(t, a) {
						var r = a[0] - t[0],
							n = a[1] - t[1],
							o = a[2] - t[2],
							e = a[3] - t[3];
						return r * r + n * n + o * o + e * e;
					}),
					(o.sqrDist = o.squaredDistance),
					(o.length = function(t) {
						var a = t[0],
							r = t[1],
							n = t[2],
							o = t[3];
						return Math.sqrt(a * a + r * r + n * n + o * o);
					}),
					(o.len = o.length),
					(o.squaredLength = function(t) {
						var a = t[0],
							r = t[1],
							n = t[2],
							o = t[3];
						return a * a + r * r + n * n + o * o;
					}),
					(o.sqrLen = o.squaredLength),
					(o.negate = function(t, a) {
						return (
							(t[0] = -a[0]),
							(t[1] = -a[1]),
							(t[2] = -a[2]),
							(t[3] = -a[3]),
							t
						);
					}),
					(o.inverse = function(t, a) {
						return (
							(t[0] = 1 / a[0]),
							(t[1] = 1 / a[1]),
							(t[2] = 1 / a[2]),
							(t[3] = 1 / a[3]),
							t
						);
					}),
					(o.normalize = function(t, a) {
						var r = a[0],
							n = a[1],
							o = a[2],
							e = a[3],
							u = r * r + n * n + o * o + e * e;
						return (
							u > 0 &&
								((u = 1 / Math.sqrt(u)),
								(t[0] = r * u),
								(t[1] = n * u),
								(t[2] = o * u),
								(t[3] = e * u)),
							t
						);
					}),
					(o.dot = function(t, a) {
						return (
							t[0] * a[0] +
							t[1] * a[1] +
							t[2] * a[2] +
							t[3] * a[3]
						);
					}),
					(o.lerp = function(t, a, r, n) {
						var o = a[0],
							e = a[1],
							u = a[2],
							i = a[3];
						return (
							(t[0] = o + n * (r[0] - o)),
							(t[1] = e + n * (r[1] - e)),
							(t[2] = u + n * (r[2] - u)),
							(t[3] = i + n * (r[3] - i)),
							t
						);
					}),
					(o.random = function(t, a) {
						return (
							(a = a || 1),
							(t[0] = n.RANDOM()),
							(t[1] = n.RANDOM()),
							(t[2] = n.RANDOM()),
							(t[3] = n.RANDOM()),
							o.normalize(t, t),
							o.scale(t, t, a),
							t
						);
					}),
					(o.transformMat4 = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = a[3];
						return (
							(t[0] = r[0] * n + r[4] * o + r[8] * e + r[12] * u),
							(t[1] = r[1] * n + r[5] * o + r[9] * e + r[13] * u),
							(t[2] =
								r[2] * n + r[6] * o + r[10] * e + r[14] * u),
							(t[3] =
								r[3] * n + r[7] * o + r[11] * e + r[15] * u),
							t
						);
					}),
					(o.transformQuat = function(t, a, r) {
						var n = a[0],
							o = a[1],
							e = a[2],
							u = r[0],
							i = r[1],
							l = r[2],
							s = r[3],
							M = s * n + i * e - l * o,
							c = s * o + l * n - u * e,
							h = s * e + u * o - i * n,
							f = -u * n - i * o - l * e;
						return (
							(t[0] = M * s + f * -u + c * -l - h * -i),
							(t[1] = c * s + f * -i + h * -u - M * -l),
							(t[2] = h * s + f * -l + M * -i - c * -u),
							(t[3] = a[3]),
							t
						);
					}),
					(o.forEach = (function() {
						var t = o.create();
						return function(a, r, n, o, e, u) {
							var i, l;
							for (
								r || (r = 4),
									n || (n = 0),
									l = o
										? Math.min(o * r + n, a.length)
										: a.length,
									i = n;
								l > i;
								i += r
							)
								(t[0] = a[i]),
									(t[1] = a[i + 1]),
									(t[2] = a[i + 2]),
									(t[3] = a[i + 3]),
									e(t, t, u),
									(a[i] = t[0]),
									(a[i + 1] = t[1]),
									(a[i + 2] = t[2]),
									(a[i + 3] = t[3]);
							return a;
						};
					})()),
					(o.str = function(t) {
						return (
							"vec4(" +
							t[0] +
							", " +
							t[1] +
							", " +
							t[2] +
							", " +
							t[3] +
							")"
						);
					}),
					(o.exactEquals = function(t, a) {
						return (
							t[0] === a[0] &&
							t[1] === a[1] &&
							t[2] === a[2] &&
							t[3] === a[3]
						);
					}),
					(o.equals = function(t, a) {
						var r = t[0],
							o = t[1],
							e = t[2],
							u = t[3],
							i = a[0],
							l = a[1],
							s = a[2],
							M = a[3];
						return (
							Math.abs(r - i) <=
								n.EPSILON *
									Math.max(1, Math.abs(r), Math.abs(i)) &&
							Math.abs(o - l) <=
								n.EPSILON *
									Math.max(1, Math.abs(o), Math.abs(l)) &&
							Math.abs(e - s) <=
								n.EPSILON *
									Math.max(1, Math.abs(e), Math.abs(s)) &&
							Math.abs(u - M) <=
								n.EPSILON *
									Math.max(1, Math.abs(u), Math.abs(M))
						);
					}),
					(t.exports = o);
			},
			function(t, a, r) {
				var n = r(1),
					o = {};
				(o.create = function() {
					var t = new n.ARRAY_TYPE(2);
					return (t[0] = 0), (t[1] = 0), t;
				}),
					(o.clone = function(t) {
						var a = new n.ARRAY_TYPE(2);
						return (a[0] = t[0]), (a[1] = t[1]), a;
					}),
					(o.fromValues = function(t, a) {
						var r = new n.ARRAY_TYPE(2);
						return (r[0] = t), (r[1] = a), r;
					}),
					(o.copy = function(t, a) {
						return (t[0] = a[0]), (t[1] = a[1]), t;
					}),
					(o.set = function(t, a, r) {
						return (t[0] = a), (t[1] = r), t;
					}),
					(o.add = function(t, a, r) {
						return (t[0] = a[0] + r[0]), (t[1] = a[1] + r[1]), t;
					}),
					(o.subtract = function(t, a, r) {
						return (t[0] = a[0] - r[0]), (t[1] = a[1] - r[1]), t;
					}),
					(o.sub = o.subtract),
					(o.multiply = function(t, a, r) {
						return (t[0] = a[0] * r[0]), (t[1] = a[1] * r[1]), t;
					}),
					(o.mul = o.multiply),
					(o.divide = function(t, a, r) {
						return (t[0] = a[0] / r[0]), (t[1] = a[1] / r[1]), t;
					}),
					(o.div = o.divide),
					(o.ceil = function(t, a) {
						return (
							(t[0] = Math.ceil(a[0])),
							(t[1] = Math.ceil(a[1])),
							t
						);
					}),
					(o.floor = function(t, a) {
						return (
							(t[0] = Math.floor(a[0])),
							(t[1] = Math.floor(a[1])),
							t
						);
					}),
					(o.min = function(t, a, r) {
						return (
							(t[0] = Math.min(a[0], r[0])),
							(t[1] = Math.min(a[1], r[1])),
							t
						);
					}),
					(o.max = function(t, a, r) {
						return (
							(t[0] = Math.max(a[0], r[0])),
							(t[1] = Math.max(a[1], r[1])),
							t
						);
					}),
					(o.round = function(t, a) {
						return (
							(t[0] = Math.round(a[0])),
							(t[1] = Math.round(a[1])),
							t
						);
					}),
					(o.scale = function(t, a, r) {
						return (t[0] = a[0] * r), (t[1] = a[1] * r), t;
					}),
					(o.scaleAndAdd = function(t, a, r, n) {
						return (
							(t[0] = a[0] + r[0] * n),
							(t[1] = a[1] + r[1] * n),
							t
						);
					}),
					(o.distance = function(t, a) {
						var r = a[0] - t[0],
							n = a[1] - t[1];
						return Math.sqrt(r * r + n * n);
					}),
					(o.dist = o.distance),
					(o.squaredDistance = function(t, a) {
						var r = a[0] - t[0],
							n = a[1] - t[1];
						return r * r + n * n;
					}),
					(o.sqrDist = o.squaredDistance),
					(o.length = function(t) {
						var a = t[0],
							r = t[1];
						return Math.sqrt(a * a + r * r);
					}),
					(o.len = o.length),
					(o.squaredLength = function(t) {
						var a = t[0],
							r = t[1];
						return a * a + r * r;
					}),
					(o.sqrLen = o.squaredLength),
					(o.negate = function(t, a) {
						return (t[0] = -a[0]), (t[1] = -a[1]), t;
					}),
					(o.inverse = function(t, a) {
						return (t[0] = 1 / a[0]), (t[1] = 1 / a[1]), t;
					}),
					(o.normalize = function(t, a) {
						var r = a[0],
							n = a[1],
							o = r * r + n * n;
						return (
							o > 0 &&
								((o = 1 / Math.sqrt(o)),
								(t[0] = a[0] * o),
								(t[1] = a[1] * o)),
							t
						);
					}),
					(o.dot = function(t, a) {
						return t[0] * a[0] + t[1] * a[1];
					}),
					(o.cross = function(t, a, r) {
						var n = a[0] * r[1] - a[1] * r[0];
						return (t[0] = t[1] = 0), (t[2] = n), t;
					}),
					(o.lerp = function(t, a, r, n) {
						var o = a[0],
							e = a[1];
						return (
							(t[0] = o + n * (r[0] - o)),
							(t[1] = e + n * (r[1] - e)),
							t
						);
					}),
					(o.random = function(t, a) {
						a = a || 1;
						var r = 2 * n.RANDOM() * Math.PI;
						return (
							(t[0] = Math.cos(r) * a),
							(t[1] = Math.sin(r) * a),
							t
						);
					}),
					(o.transformMat2 = function(t, a, r) {
						var n = a[0],
							o = a[1];
						return (
							(t[0] = r[0] * n + r[2] * o),
							(t[1] = r[1] * n + r[3] * o),
							t
						);
					}),
					(o.transformMat2d = function(t, a, r) {
						var n = a[0],
							o = a[1];
						return (
							(t[0] = r[0] * n + r[2] * o + r[4]),
							(t[1] = r[1] * n + r[3] * o + r[5]),
							t
						);
					}),
					(o.transformMat3 = function(t, a, r) {
						var n = a[0],
							o = a[1];
						return (
							(t[0] = r[0] * n + r[3] * o + r[6]),
							(t[1] = r[1] * n + r[4] * o + r[7]),
							t
						);
					}),
					(o.transformMat4 = function(t, a, r) {
						var n = a[0],
							o = a[1];
						return (
							(t[0] = r[0] * n + r[4] * o + r[12]),
							(t[1] = r[1] * n + r[5] * o + r[13]),
							t
						);
					}),
					(o.forEach = (function() {
						var t = o.create();
						return function(a, r, n, o, e, u) {
							var i, l;
							for (
								r || (r = 2),
									n || (n = 0),
									l = o
										? Math.min(o * r + n, a.length)
										: a.length,
									i = n;
								l > i;
								i += r
							)
								(t[0] = a[i]),
									(t[1] = a[i + 1]),
									e(t, t, u),
									(a[i] = t[0]),
									(a[i + 1] = t[1]);
							return a;
						};
					})()),
					(o.str = function(t) {
						return "vec2(" + t[0] + ", " + t[1] + ")";
					}),
					(o.exactEquals = function(t, a) {
						return t[0] === a[0] && t[1] === a[1];
					}),
					(o.equals = function(t, a) {
						var r = t[0],
							o = t[1],
							e = a[0],
							u = a[1];
						return (
							Math.abs(r - e) <=
								n.EPSILON *
									Math.max(1, Math.abs(r), Math.abs(e)) &&
							Math.abs(o - u) <=
								n.EPSILON *
									Math.max(1, Math.abs(o), Math.abs(u))
						);
					}),
					(t.exports = o);
			}
		]);
	});
var Camera = (function() {
		function t(t, a, r, n, o, e, u) {
			(this.eye = t),
				(this.center = a),
				(this.up = r),
				(this.fov = n),
				(this.aspect = o),
				(this.near = e),
				(this.far = u),
				(this.worldToCamera = mat4.create()),
				mat4.lookAt(this.worldToCamera, this.eye, this.center, this.up),
				(this.cameraToWorld = mat4.create()),
				mat4.invert(this.cameraToWorld, this.worldToCamera),
				(this.cameraToClip = mat4.create()),
				mat4.perspective(
					this.cameraToClip,
					this.fov,
					this.aspect,
					this.near,
					this.far
				),
				(this.clipToCamera = mat4.create()),
				mat4.invert(this.clipToCamera, this.cameraToClip);
		}
		return t;
	})(),
	Light = (function() {
		function t(t, a, r, n) {
			(this.position = t),
				(this.ambient = a),
				(this.diffuse = r),
				(this.specular = n);
		}
		return t;
	})(),
	Material = (function() {
		function t(t, a, r, n) {
			(this.ambient = t),
				(this.diffuse = a),
				(this.specular = r),
				(this.shine = n);
		}
		return t;
	})(),
	Shader = (function() {
		function t(t, a, r, n, o, e) {
			var u = this.createProgram(t, a, r);
			return u
				? (t.useProgram(u),
				  (t.program = u),
				  this.setPosition(t, e),
				  this.setNormal(t, e),
				  this.setUniformsModelViewMatrix(t, e, o),
				  this.setUniformsNormalMatrix(t),
				  this.setUniformsProjectionMatrix(t, o),
				  this.setUniformsModelViewProjectionMatrix(t, o),
				  this.setUniformsLights(t, n),
				  void this.setUniformsMaterials(t, e))
				: void console.log(
						"Shader.ts: constructor: Failed to create program: ",
						u
				  );
		}
		return (
			(t.prototype.draw = function(t, a) {
				t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, a.indicesBuffer),
					t.clear(t.COLOR_BUFFER_BIT | t.DEPTH_BUFFER_BIT),
					t.drawElements(
						t.TRIANGLES,
						a.indicesCount,
						t.UNSIGNED_SHORT,
						0
					);
			}),
			(t.prototype.createProgram = function(t, a, r) {
				var n = this.loadShader(t, t.VERTEX_SHADER, a),
					o = this.loadShader(t, t.FRAGMENT_SHADER, r);
				if (!n || !o)
					return (
						console.log(
							"Shader.ts: createProgram: No vertex shader or fragment shader: ",
							n,
							", ",
							o
						),
						null
					);
				var e = t.createProgram();
				if (!e)
					return (
						console.log(
							"Shader.ts: createProgram: No program: ",
							e
						),
						null
					);
				t.attachShader(e, n), t.attachShader(e, o), t.linkProgram(e);
				var u = t.getProgramParameter(e, t.LINK_STATUS);
				if (!u) {
					var i = t.getProgramInfoLog(e);
					return (
						console.log(
							"Shader.ts: createProgram: Failed to link program: " +
								i
						),
						t.deleteProgram(e),
						t.deleteShader(o),
						t.deleteShader(n),
						null
					);
				}
				return e;
			}),
			(t.prototype.loadShader = function(t, a, r) {
				var n = t.createShader(a);
				if (null == n)
					return (
						console.log("Shader.ts: loadShader: shader === null."),
						null
					);
				t.shaderSource(n, r), t.compileShader(n);
				var o = t.getShaderParameter(n, t.COMPILE_STATUS);
				if (!o) {
					var e = t.getShaderInfoLog(n);
					return (
						console.log(
							"Shader.ts: loadShader: Failed to compile shader: " +
								e
						),
						t.deleteShader(n),
						null
					);
				}
				return n;
			}),
			(t.prototype.setPosition = function(t, a) {
				t.bindBuffer(t.ARRAY_BUFFER, a.positionsBuffer);
				var r = t.getAttribLocation(t.program, "a_Position");
				t.vertexAttribPointer(r, 3, t.FLOAT, !1, 0, 0),
					t.enableVertexAttribArray(r);
			}),
			(t.prototype.setNormal = function(t, a) {
				t.bindBuffer(t.ARRAY_BUFFER, a.normalsBuffer);
				var r = t.getAttribLocation(t.program, "a_Normal");
				t.vertexAttribPointer(r, 3, t.FLOAT, !1, 0, 0),
					t.enableVertexAttribArray(r);
			}),
			(t.prototype.setUniformsModelViewMatrix = function(t, a, r) {
				(this.modelViewMatrix = mat4.create()),
					mat4.multiply(
						this.modelViewMatrix,
						r.worldToCamera,
						a.modelToWorld
					);
				var n = t.getUniformLocation(t.program, "u_ModelViewMatrix");
				t.uniformMatrix4fv(n, !1, this.modelViewMatrix);
				var o = mat4.create();
				mat4.invert(o, this.modelViewMatrix);
				var e = t.getUniformLocation(
					t.program,
					"u_ModelViewMatrixInverse"
				);
				t.uniformMatrix4fv(e, !1, o);
			}),
			(t.prototype.setUniformsNormalMatrix = function(t) {
				var a = mat3.create();
				mat3.normalFromMat4(a, this.modelViewMatrix);
				var r = t.getUniformLocation(t.program, "u_NormalMatrix");
				t.uniformMatrix3fv(r, !1, a);
			}),
			(t.prototype.setUniformsProjectionMatrix = function(t, a) {
				var r = t.getUniformLocation(t.program, "u_ProjectionMatrix");
				t.uniformMatrix4fv(r, !1, a.cameraToClip);
				var n = t.getUniformLocation(
					t.program,
					"u_ProjectionMatrixInverse"
				);
				t.uniformMatrix4fv(n, !1, a.clipToCamera);
			}),
			(t.prototype.setUniformsModelViewProjectionMatrix = function(t, a) {
				var r = mat4.create();
				mat4.multiply(r, a.cameraToClip, this.modelViewMatrix);
				var n = t.getUniformLocation(
					t.program,
					"u_ModelViewProjectionMatrix"
				);
				t.uniformMatrix4fv(n, !1, r);
				var o = mat4.create();
				mat4.invert(o, r);
				var e = t.getUniformLocation(
					t.program,
					"u_ModelViewProjectionMatrixInverse"
				);
				t.uniformMatrix4fv(e, !1, o);
			}),
			(t.prototype.setUniformsLights = function(t, a) {
				var r = t.getUniformLocation(t.program, "u_Light.position");
				t.uniform4fv(r, a.position);
				var n = t.getUniformLocation(t.program, "u_Light.ambient");
				t.uniform3fv(n, a.ambient);
				var o = t.getUniformLocation(t.program, "u_Light.diffuse");
				t.uniform3fv(o, a.diffuse);
				var e = t.getUniformLocation(t.program, "u_Light.specular");
				t.uniform3fv(e, a.specular);
			}),
			(t.prototype.setUniformsMaterials = function(t, a) {
				var r = t.getUniformLocation(t.program, "u_Material.ambient");
				t.uniform3fv(r, a.material.ambient);
				var n = t.getUniformLocation(t.program, "u_Material.diffuse");
				t.uniform3fv(n, a.material.diffuse);
				var o = t.getUniformLocation(t.program, "u_Material.specular");
				t.uniform3fv(o, a.material.specular);
				var e = t.getUniformLocation(t.program, "u_Material.shine");
				t.uniform1f(e, a.material.shine);
			}),
			t
		);
	})(),
	Sphere = (function() {
		function t(t, a, r, n, o) {
			(this.radius = a),
				(this.latitudeBands = r),
				(this.longitudeBands = n),
				(this.material = o),
				this.buildArrays(),
				this.buildBuffers(t),
				this.buildTransforms();
		}
		return (
			(t.prototype.buildArrays = function() {
				for (
					var t = [], a = [], r = [], n = [], o = 0;
					o <= this.latitudeBands;
					++o
				)
					for (
						var e = (o * Math.PI) / this.latitudeBands,
							u = Math.sin(e),
							i = Math.cos(e),
							l = 0;
						l <= this.longitudeBands;
						++l
					) {
						var s = (2 * l * Math.PI) / this.longitudeBands,
							M = Math.sin(s),
							c = Math.cos(s),
							h = c * u,
							f = i,
							m = M * u,
							S = 1 - l / this.longitudeBands,
							x = 1 - o / this.latitudeBands;
						t.push(this.radius * h),
							t.push(this.radius * f),
							t.push(this.radius * m),
							a.push(h),
							a.push(f),
							a.push(m),
							r.push(S),
							r.push(x);
					}
				for (var o = 0; o < this.latitudeBands; ++o)
					for (var l = 0; l < this.longitudeBands; ++l) {
						var I = o * (this.longitudeBands + 1) + l,
							d = I + this.longitudeBands + 1;
						n.push(I),
							n.push(d),
							n.push(I + 1),
							n.push(d),
							n.push(d + 1),
							n.push(I + 1);
					}
				(this.indicesCount = n.length),
					(this.positions = new Float32Array(t)),
					(this.normals = new Float32Array(a)),
					(this.textureCoords = new Float32Array(r)),
					(this.indices = new Uint16Array(n));
			}),
			(t.prototype.buildBuffers = function(t) {
				(this.positionsBuffer = t.createBuffer()),
					(this.normalsBuffer = t.createBuffer()),
					(this.textureCoordsBuffer = t.createBuffer()),
					(this.indicesBuffer = t.createBuffer()),
					t.bindBuffer(t.ARRAY_BUFFER, this.positionsBuffer),
					t.bufferData(t.ARRAY_BUFFER, this.positions, t.STATIC_DRAW),
					t.bindBuffer(t.ARRAY_BUFFER, this.normalsBuffer),
					t.bufferData(t.ARRAY_BUFFER, this.normals, t.STATIC_DRAW),
					t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indicesBuffer),
					t.bufferData(
						t.ELEMENT_ARRAY_BUFFER,
						this.indices,
						t.STATIC_DRAW
					);
			}),
			(t.prototype.buildTransforms = function() {
				(this.modelToWorld = mat4.create()),
					(this.worldToModel = mat4.create()),
					mat4.invert(this.worldToModel, this.modelToWorld);
			}),
			t
		);
	})();
