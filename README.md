# cram

## About

cram (computational room acoustic module) is an application that allows users to simulate and explore various acoustic properties of a modeled space.

### Features
- Interactive model editor with navigation controls
- Free and open-source (MIT License)
- Cross platform
- Diverse set of solvers
- Comprehensive material library
- Project saving
- Result export

### Solvers
- Statistical Reverberation time using Sabine, Eyring, and Arau-Puchades methods
- Stochastic Ray Tracing to produce an impulse response
- Image Source Method for early reflection analysis
- Finite Difference Time Domain (2D) for modal analysis 

### Theory / Implementation
For more information on the theory and implementation of CRAM, including: 
- How Ray Tracing is implemented
- How the Image Source Method calculations are completed
- Comparisons of results from CRAM to other acoustical software

Please refer to [this final paper](https://drive.google.com/file/d/1UA8e-UVUFJ3vohHSwflnjhcNNE7uAwlD/view?usp=sharing) written by Jack Breton and Greg Zanchelli. Note that this paper was last updated in May 2021 and some portions may no longer be reflected in the code. 

## Getting Started
It's easy to use CRAM to model the acoustic behavior of a room. This illustrative "getting started" tutorial will give users a brief introduction into the usage of CRAM for in-browser acoustic modeling by showing the process of modeling a simple auditorium. <b> This example model (with geometry already imported and materials already assigned) is included in CRAM under (Examples -> Auditorium) </b>

### Modeling Room Geometry
First and foremost, you need the 3-Dimensional geometry of the room that you wish to model. This can be created using any 3D modeling software that supports the export to (as of currently) the following 3D file types:  
- 3D DXF (AutoCAD) 
- OBJ (Wavefront) 

One of the most common 3D modeling programs for Architectural Acoustics is <b>SketchUp</b>. In SketchUp, we may assign different groups of surfaces in our room model to <i>Tags</i> (previously known as <i>Layers</i>). In our example auditorium model, we'll group our tags into intuitive groups based on room geometry, as shown below. 

![image](https://user-images.githubusercontent.com/74570882/123519573-2892de00-d67a-11eb-8d39-7b15d4e37089.png)

Now, we'll export our file as a 3D DXF file from SketchUp by clicking (File -> Export -> 3D Model), as DXF files retain layer data. 

### Importing Room Geometry into CRAM 
Next, we will navigate to the live build of CRAM at [cram.vercel.app](cram.vercel.app). In CRAM, a new model was created and the geometry was imported by selecting File -> Import and importing the DXF file exported from SketchUp. All geometry and surface groups (tags) are preserved upon import, as shown below. 

![image](https://user-images.githubusercontent.com/74570882/123519835-9db2e300-d67b-11eb-8cd7-f57ce5aa4bd4.png)

### Assigning Materials
At the heart of room acoustics simulation lie the acoustic properties of the materials in a space. The octave band absorption coefficients (α) of each material are frequency-dependent values which quantifies the amount of sound energy that is <b>not reflected</b> from the material at a given octave band. 

CRAM comes pre-loaded with a plethora of acoustic materials collected from various sources including textbooks and the University of Hartford Acoustic Material Database. Please note that these values are mostly <i>lab measured</i>, and may not exactly describe materials in a given environment, although they are a good estimate. To assign each surface group (tag) to an appropriate material, click an arbitrary surface and select the material control button in the Object viewer to bring up the material selection menu. 

![image](https://user-images.githubusercontent.com/74570882/123521005-f4bbb680-d681-11eb-8f8e-fb7577fed574.png)

At this point, each group of surfaces may be selected and assigned the correct material from CRAM’s material database, as shown below. 
![image](https://user-images.githubusercontent.com/74570882/123521026-09984a00-d682-11eb-9b58-13d5b234bbd4.png)

### Assigning Sources and Receivers
The basis of room acoustics simulations involves the definition, placement, and use of sources and receivers. In CRAM, the user may place sources and receivers throughout a model, as well as change settings of these objects. By default, sources are assigned the color green and receivers are assigned the color red. The user may add a source to the model by selecting Add -> Source or Add -> Receiver. Sources and receivers are placed on the model origin by default. The user may edit the name, visibility, and the position / scale / rotation of the source by clicking on the source in the object tree and accessing the settings in the Object Viewer.

In our model, we'll add a source, name it “stage source”, and place it at the center of the stage area (XYZ coordinates = [2, 6.76, 1]) . This source will be considered an omnidirectional source for the purposes of this example. We'll also add a receiver, name it “audience receiver”, and placed it in the middle of the audience area (XYZ coordinates = [15.5, 10, 1]). The image below shows the placement of the source and receiver in the example model. 

![image](https://user-images.githubusercontent.com/74570882/123521253-81b33f80-d683-11eb-8d14-fc08546c9a5c.png)

### Statistical Reverberation Time Estimate

Statistical reverberation time estimates using the Sabine and Eyring equations are useful for determining initial estimates of reverberation time, as well as verification of correct material placement. Statistical RT60 estimates are computed for the test model by adding a Statistical RT solver via the add menu (Add -> Statistical RT). 

When we create a new Statistical RT60 solver, a solver settings control panel is created as shown below, allowing the user to set the name of the solver, manually override the volume of the room, update the results, and download the results. The volume of the room defaults to the value that is automatically calculated from the current model mesh. In rare cases, this may be incorrect, so CRAM allows the user to override this value if necessary, for the purposes of the statistical RT60 calculation. We may also download results in CSV format. 
![image](https://user-images.githubusercontent.com/74570882/123521557-66493400-d685-11eb-8f2d-c87df4c7d1f1.png)

When we update the RT60 calculation, the Sabine, Norris-Eyring, and Arau-Puchades reverberation time values are automatically calculated for the auditorium as shown below. These results are displayed graphically in the result window under a new “Statistical RT60 Results” tab, shown below. Please note that currently, CRAM is “hard coded” to assume air absorption coefficients from air at 20°C and 40% RH. Future releases will allow the user to specify custom room air conditions.

![image](https://user-images.githubusercontent.com/74570882/123521602-b7592800-d685-11eb-9bd5-b40187b1ec57.png)

If we compare these values to those calculated by a spreadsheet utilizing the same equations, they are identical. 

### Image Source Early Reflection Finder
The Image Source Method is a geometrical acoustics method for determining the paths of early specular reflections (typically reflections with order less than 6 or 7). The CRAM Image Source Solver may be used to determine these early reflection paths in a given space. This is especially useful in situations where the timing and relative level of early reflections are extremely important (e.g. an auditorium or concert hall). An Image Source Solver may be added to the model by selecting (Add -> Image Source). 

When we create a new Image Source solver, a solver settings control panel is created as shown below. This interface allows us to choose a predefined source and receiver to use, specify the maximum order of reflection to find, and update/clear the calculation. This panel also gives us plot controls such as the ability to show and hide ray paths and image sources and choose to plot specific reflection orders. 

![image](https://user-images.githubusercontent.com/74570882/123521831-26834c00-d687-11eb-99b3-65003879a55f.png)

In our model, the maximum order of the image sources solver will be set to 4, and the stage source and audience receiver are selected as the active source and receiver, respectively. 

We'll press the “update” button, and CRAM will calculate the image source early reflection paths in the space (up to order 4). The ray paths of the early reflections are shown in the model, while the <b>level-time progression</b> (sound pressure level vs. arrival time of each ray) is shown in the bottom result bar. Here, we may also choose what frequency to show. Clicking any of the level time progression bars results in the associated ray path being highlighted on the model. 

![image](https://user-images.githubusercontent.com/74570882/123521880-65190680-d687-11eb-8edf-51f1fb3127cc.png)

### Raytracer
Ray Tracing (also known as Ray Casting) is a computational room acoustics method that casts a finite number of sound rays from a source and traces each ray’s behavior in a three-dimensional environment. The end goal of the Ray Tracer is to generate a room impulse response (RIR) which represents the acoustic response of a room to a dirac delta (impulse) input. Many important room acoustics results may be derived from a given RIR including: 
- Reverberation Time (T60, T30, T20)
- Speech Clarity Index (C80)
- Convolution (simulation of how an acoustic input will sound in a space) 

The Ray Tracer is implemented in CRAM as a standalone solver. The Ray Tracer solver is responsible for performing the Ray Tracing calculations, as well as generating an impulse response from the ray paths. We can add a Ray Tracer solver to the model by clicking (Add -> Ray Tracer). This interface allows us to change relevant Ray Tracer parameters such as: 
- <b>Rate:</b> the rate at which the main "shoot ray" function is called 
- <b>Order:</b> the maximum order of ray path to find
- <b>Passes:</b> how many rays are checked at each function call
- The active source(s)
- The active receiver(s)
- Graphical settings
- Hybrid method settings (Image Source for early reflections, Ray Tracing for late reflections) 
- Options for playing or downloading the resulting impulse response. 

The Ray Tracer interface is shown below: 
![image](https://user-images.githubusercontent.com/74570882/123522039-b5449880-d688-11eb-9a1d-24a1c8258179.png)

We will leave the default (Rate, Order, Passes) settings and select the "stage source" and "audience receiver" as our source and receiver, respectively. The Running checkbox is selected and the Ray Tracer is started. Rays from the source to the receiver with reflection orders less than or equal to the maximum order setting are calculated and displayed on the renderer. The Ray Tracer may be run as long as desired, but in this case, was stopped after about 10 minutes (16,000 valid rays). 

The model during ray tracing (with a low number of reflections) is shown below 
![image](https://user-images.githubusercontent.com/74570882/123522129-69462380-d689-11eb-8d39-958021d1750b.png)

The resulting impulse reponse is downloaded by clicking the "download" button.

### Impulse Response Analysis (Energy Decay)
An impulse response may be analyzed to determine acoustical parameters of a room such as reverberation time (T20, T30, T60), early decay time (EDT), as well as speech clarity parameters (STI, C80, etc.). This analysis is completed by determining the octave-band energy decay patterns of a broadband impulse response and analyzing the energy decays for acoustical parameters. 

The CRAM energy decay solver exists as a standalone solver for the analysis of an arbitrary impulse response. We can add an impulse response analyzer to the model by clicking (Add -> Energy Decay). The resulting interface allows us to upload an impulse response and analyze it. The subsequent results are downloaded as a .CSV file which conveniently  permits further analysis. 
![image](https://user-images.githubusercontent.com/74570882/123522244-25075300-d68a-11eb-9a69-4c8dc4633d1d.png)

## Design Goals

### Intuitive

should have an intuitive user interface, and should follow the design patterns of modern 3D CAD software ([SketchUp](https://www.sketchup.com/), [Blender](https://www.blender.org/), [Fusion 360](https://www.autodesk.com/products/fusion-360/overview), etc.)

### Interactive

should have an interactive model editor with easy to use navigation, selection, and transformation controls.

### Responsive

should always be responsive to parameter changes which are reflected in the model editor. For example, user should be allowed to change a source's position while recording a FDTD simulation.

### Free

should be free and open source using [MIT license](https://choosealicense.com/licenses/mit/)

### Cross Platform

should run in a modern browser (Chrome, Firefox, Brave, Safari, Edge), and on most platforms (macOS, Windows, Linux, iOS, Android, Raspbian)

### Solution Diversity

should provide a diverse set of solution/simulation types, namely:

- Reverberation time using various equations (Sabine, Eyring, Arau-Puchades, etc.)
- Geometric Acoustics
    - Stochastic Ray Tracing (Monte-Carlo / Diffuse Rain)
    - Image Source Method
    - [Acoustic Radiosity and Radiance Transfer](http://interactiveacoustics.info/html/GA_radiance.html#)
- Wave Based Solutions
    - FDTD in 2 dimensions with various boundary conditions ([Neumann](https://en.wikipedia.org/wiki/Neumann_boundary_condition), Open/[PML](https://en.wikipedia.org/wiki/Perfectly_matched_layer))

### Material Diversity

should provide access to a large material database with modern search tools

### Simple IO

should have saving/loading functionality using human readable/editable JSON, as well as state persistence using local storage.

### Result Export

should be able to export solution results to various formats:

- Tabularized (.csv, .txt)
- Spreadsheet (.xlsx)
- Image (.svg, .png, .gif)
- Audio (.wav)

### Import Diversity

should be able to read various 3d mesh file types, namely: 

- Wavefront (OBJ)
- GLTF
- STL
- Collada (DAE)
- PLY

### Result Visualization

should be able to view results using various chart types or visually in the model editor
