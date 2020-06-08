export const layout = JSON.stringify({
  leftPanelInitialSize: 200,
  bottomPanelInitialSize: 1,
  rightPanelInitialSize: 300,
  rightPanelTopInitialSize: 300
});

export const camera = JSON.stringify({
         metadata: { version: 4.5, type: "Object", generator: "Object3D.toJSON" },
         object: {
           uuid: "0A298473-BABD-4E19-8A96-B12FA9E385E3",
           type: "PerspectiveCamera",
           layers: -1,
           matrix: [
             0.8982657387772196,
             -0.439452685210838,
             2.7755575615628914e-17,
             0,
             0.16707067900318084,
             0.34150176333728044,
             0.9249129331212447,
             0,
             -0.40645547204636334,
             -0.83081759917476,
             0.3801789922458312,
             0,
             -13.52050250806736,
             -25.029452670403685,
             11.80734082664881,
             1
           ],
           fov: 45,
           zoom: 1,
           near: 0.001,
           far: 500,
           focus: 10,
           aspect: 2.413793103448276,
           filmGauge: 35,
           filmOffset: 0,
           quat: [0.5423525106409364, -0.1255557966744563, -0.18735760601809792, 0.8093124387960948],
           pos: [-13.52050250806736, -25.029452670403685, 11.80734082664881],
           target: [-0.31053201497406996, 1.9724619919465611, -0.5486332346095051]
         }
       });

export const orientationControl = JSON.stringify({
  width: 180,
  height: 180,
  axis: "none"
});

export default {
  layout,
  camera,
  orientationControl
};
