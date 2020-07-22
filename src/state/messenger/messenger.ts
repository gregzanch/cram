import { KVP } from "../../common/key-value-pair";
import Actions, { StateAction } from "../actions";
import short from "short-uuid";
import { Processes } from "../../constants/processes";
import Container, { ContainerSaveObject } from "../../objects/container";
import RayTracer, { RayTracerParams } from "../../compute/raytracer";
import RT60, { RT60Props } from "../../compute/rt";
import { Surface, SurfaceSaveObject } from "../../objects/surface";
import { Source, SourceSaveObject } from '../../objects/source';
import { Receiver, ReceiverSaveObject } from '../../objects/receiver';
import { ApplicationSettings, EditorSettings, GeneralSettings, KeyBindingsSettings } from "../../default-settings";
import { AcousticMaterial } from "../../db/acoustic-material";
import { FDTD_2D, FDTD_2D_Props } from "../../compute/2d-fdtd";
import Room, { RoomSaveObject } from "../../objects/room";
import Renderer from "../../render/renderer";
import AudioFile from "../../objects/audio-file";
import { IToastProps } from "@blueprintjs/core/lib/esm/components/toast/toast";
import { Setting } from "../../setting";
import { EditorModes } from "../../constants";
import Solver from "../../compute/solver";

import { OrientationControlTargets } from '../../render/orientation-control/orientation-control';
import { Stat } from "../../components/parameter-config/Stats";

const uuid = () => short.generate();

export type MessengerDictionary = {
  [key in StateAction]: KVP<EventHandler>;
};

export interface ActionArgs {
  [Actions.ADDED_AUDIO_FILE]: {
    audiofile: Float32Array;
  };
}

interface PostMessageArgs {
  $collect?: boolean;
}

interface FileListArgs extends PostMessageArgs {
  fileList: FileList;
}

interface ObjectWithIdArgs extends PostMessageArgs {
  id: string;
}

interface ConstructionArgs extends PostMessageArgs {
  construction: Container;
}

type ArgId = { id: string } & PostMessageArgs;
type ArgIds = { ids: string[]; } & PostMessageArgs;
type ArgName = { name: string; } & PostMessageArgs;
type ArgCanvas = { canvas: HTMLCanvasElement; } & PostMessageArgs;
type ArgColor<T> = { color: T; } & PostMessageArgs;
type ArgBackground = { background: string; } & PostMessageArgs;
type ArgToast = IToastProps & PostMessageArgs;
type ArgFileList = { fileList: FileList } & PostMessageArgs;
type ArgAudioFile = { file: AudioFile } & PostMessageArgs;
type ArgConstruction = { construction: Container; } & PostMessageArgs;
type ArgRoom = { room: Room; } & PostMessageArgs;
type ArgObjectsArray = { objects: Container[] } & PostMessageArgs;
type ArgQueryString = { query: string; } & PostMessageArgs;
type ArgAddRayTracer = { props?: RayTracerParams; } & PostMessageArgs;
type ArgAddRT60 = { props?: RT60Props; } & PostMessageArgs;
type ArgAdd2DFDTD = { props?: FDTD_2D_Props; } & PostMessageArgs;
type ArgAddSource = { props?: Source; addMoment?: boolean; } & PostMessageArgs;
type ArgAddReceiver = { props?: Receiver; addMoment?: boolean; }& PostMessageArgs;
type ArgRayTracerResponse = { id: string, frequencies: number[]; };
type ArgsRestore = { file: File | { name: string; }, json: any; } & PostMessageArgs;
type ArgMaterial = { material: AcousticMaterial; } & PostMessageArgs;
type ArgProcess = { process: Processes; } & PostMessageArgs;
type ArgSettingValue = { setting: string, value: any; } & PostMessageArgs;
type ArgEditorMode = { mode: EditorModes; } & PostMessageArgs;
type ArgAnimate = { animate: boolean; } & PostMessageArgs;
type ArgRestoreSolvers = { solvers: Array<RayTracerParams|RT60Props|FDTD_2D_Props>; } & PostMessageArgs;
type ArgRestoreContainers = { containers: Array<SurfaceSaveObject|SourceSaveObject|ReceiverSaveObject|RoomSaveObject|ContainerSaveObject>; } & PostMessageArgs;
type ArgSave = { filename: string, callback?: () => void; } & PostMessageArgs;
type ArgOrientationAxis = { axis: OrientationControlTargets; } & PostMessageArgs;
type ContainerObject = Source | Receiver | Surface | Room | Container;
type ArgRayTracerSourceChange = { id: string, sources: Array<any>; } & PostMessageArgs;
type ArgRayTracerReceiverChange = { id: string, receivers: Array<any>; } & PostMessageArgs;
type ArgOpenMaterialDrawer = { object: Surface; } & PostMessageArgs;
type ArgStats = { stats: KVP<Stat>; } & PostMessageArgs;
type ArgContainer = { container: Container; } & PostMessageArgs;
type ArgSolver = { solver: Solver; } & PostMessageArgs;



type ArgRes<A, R> = { args: A, res: R }

export interface PostMessageMap {
    
  [Actions.FETCH_ALL_SETTINGS]: ArgRes<PostMessageArgs, ApplicationSettings>;
  [Actions.FETCH_SETTINGS__GENERAL]: ArgRes<PostMessageArgs, GeneralSettings>;
  [Actions.FETCH_SETTINGS__EDITOR]: ArgRes<PostMessageArgs, EditorSettings>;
  [Actions.FETCH_SETTINGS__KEYBINDINGS]: ArgRes<PostMessageArgs, KeyBindingsSettings>;
  [Actions.SUBMIT_ALL_SETTINGS]: ArgRes<PostMessageArgs, ApplicationSettings>;
  [Actions.SUBMIT_SETTINGS__GENERAL]: ArgRes<PostMessageArgs, ApplicationSettings>;
  [Actions.SUBMIT_SETTINGS__EDITOR]: ArgRes<PostMessageArgs, ApplicationSettings>;
  [Actions.SETTING_CHANGE]: ArgRes<ArgSettingValue, ApplicationSettings>;
  
  
  [Actions.FETCH_ALL_SOURCES]: ArgRes<PostMessageArgs, Source[]>;
  [Actions.FETCH_ALL_SOURCES_AS_MAP]: ArgRes<PostMessageArgs, Map<string,Source>>;
  
  
  [Actions.FETCH_ALL_MATERIALS]: ArgRes<PostMessageArgs, AcousticMaterial[]>;
  [Actions.SEARCH_ALL_MATERIALS]: ArgRes<ArgQueryString, AcousticMaterial[]>;
  
  
  [Actions.SHOULD_REMOVE_SOLVER]: ArgRes<ArgId, undefined>;
  [Actions.SHOULD_ADD_RAYTRACER]: ArgRes<ArgAddRayTracer, RayTracer>;
  [Actions.SHOULD_ADD_RT60]: ArgRes<ArgAddRT60, RT60>;
  [Actions.SHOULD_ADD_FDTD_2D]: ArgRes<ArgAdd2DFDTD, FDTD_2D>;
  [Actions.SHOULD_ADD_FDTD]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SHOULD_ADD_SOURCE]: ArgRes<ArgAddSource, Source>;
  [Actions.SHOULD_ADD_RECEIVER]: ArgRes<ArgAddReceiver, Receiver>;
  [Actions.SHOULD_ADD_SKETCH]: ArgRes<PostMessageArgs, undefined>;
  
  [Actions.GET_SELECTED_OBJECTS]: ArgRes<PostMessageArgs, ContainerObject[]>;
  [Actions.FETCH_CONTAINER]: ArgRes<ArgId, ContainerObject>;
  [Actions.FETCH_ROOMS]: ArgRes<PostMessageArgs, Room[]>;
  [Actions.GET_SELECTED_OBJECT_TYPES]: ArgRes<PostMessageArgs, string[]>;
  [Actions.APPEND_SELECTION]: ArgRes<ArgObjectsArray, undefined>;
  [Actions.DESELECT_ALL_OBJECTS]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SET_SELECTION]: ArgRes<ArgObjectsArray, undefined>;
  [Actions.ADD_CONSTRUCTION]: ArgRes<ArgConstruction, undefined>;
  [Actions.GET_CONSTRUCTIONS]: ArgRes<PostMessageArgs, KVP<Container>>;
  [Actions.REMOVE_CONSTRUCTION]: ArgRes<ArgId, undefined>;
  [Actions.IMPORT_FILE]: ArgRes<ArgFileList, undefined>;
  [Actions.RAYTRACER_SHOULD_PLAY]: ArgRes<ArgId, undefined>;
  [Actions.RAYTRACER_SHOULD_PAUSE]:  ArgRes<ArgId, undefined>;
  [Actions.RAYTRACER_SHOULD_CLEAR]:  ArgRes<ArgId, undefined>;
  [Actions.RAYTRACER_CALCULATE_RESPONSE]:  ArgRes<ArgRayTracerResponse, undefined>;
  [Actions.RAYTRACER_QUICK_ESTIMATE]: ArgRes<ArgId, undefined>;
  [Actions.GET_PROCESS]: ArgRes<ArgId, Processes>;
  [Actions.SET_PROCESS]: ArgRes<ArgProcess, undefined>;


  [Actions.GET_RENDERER]:  ArgRes<PostMessageArgs, Renderer>;
  [Actions.FETCH_SURFACES]: ArgRes<ArgIds, Surface[]|null>;
  [Actions.GET_CONTAINERS]: ArgRes<PostMessageArgs, ContainerObject[]>;


  [Actions.FETCH_ALL_RECEIVERS]: ArgRes<PostMessageArgs, Receiver[]>;
  [Actions.FETCH_SOURCE]: ArgRes<ArgId, Source>;



  [Actions.ASSIGN_MATERIAL]: ArgRes<ArgMaterial, undefined>;



  

  
  
  

  [Actions.SHOULD_REMOVE_SKETCH]: ArgRes<ArgId, undefined>;
  [Actions.SHOULD_REMOVE_CONTAINER]: ArgRes<ArgId, undefined>;
  [Actions.RAYTRACER_SOURCE_CHANGE]: ArgRes<ArgRayTracerSourceChange, undefined>;
  [Actions.RAYTRACER_RECEIVER_CHANGE]: ArgRes<ArgRayTracerReceiverChange, undefined>;
  [Actions.CAN_DUPLICATE]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SHOULD_DUPLICATE_SELECTED_OBJECTS]: ArgRes<PostMessageArgs, undefined>;
  [Actions.ADDED_SOURCE]: ArgRes<ArgContainer, undefined>;
  [Actions.ADDED_RECEIVER]: ArgRes<ArgContainer, undefined>;
  [Actions.ADDED_FDTD]: ArgRes<ArgSolver, undefined>;
  [Actions.ADDED_FDTD_2D]: ArgRes<ArgSolver, undefined>;
  [Actions.ADDED_RAYTRACER]: ArgRes<ArgSolver, undefined>;
  [Actions.ADDED_RT60]: ArgRes<ArgSolver, undefined>;
  [Actions.ADDED_ROOM]: ArgRes<ArgRoom, undefined>;
  [Actions.ADDED_AUDIO_FILE]: ArgRes<ArgAudioFile, undefined>;
  [Actions.APP_MOUNTED]: ArgRes<ArgCanvas, undefined>;
  [Actions.RENDERER_UPDATED]: ArgRes<PostMessageArgs, undefined>;
  [Actions.NEW]: ArgRes<PostMessageArgs, undefined>;
  [Actions.CAN_UNDO]: ArgRes<PostMessageArgs, undefined>;
  [Actions.CAN_REDO]: ArgRes<PostMessageArgs, undefined>;
  [Actions.UNDO]: ArgRes<PostMessageArgs, undefined>;
  [Actions.REDO]: ArgRes<PostMessageArgs, undefined>;
  
  [Actions.CUT]: ArgRes<PostMessageArgs, undefined>;
  [Actions.COPY]: ArgRes<PostMessageArgs, undefined>;
  [Actions.PASTE]: ArgRes<PostMessageArgs, undefined>;
  
  
  
  [Actions.MOVE_SELECTED_OBJECTS]: ArgRes<PostMessageArgs, undefined>;
  [Actions.PHASE_OUT]: ArgRes<PostMessageArgs, undefined>;
  [Actions.STOP_OPERATIONS]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SET_EDITOR_MODE]: ArgRes<ArgEditorMode, undefined>;
  [Actions.GET_EDITOR_MODE]: ArgRes<PostMessageArgs, EditorModes>;
  [Actions.SET_PROJECT_NAME]: ArgRes<ArgName, undefined>;
  [Actions.GET_PROJECT_NAME]: ArgRes<PostMessageArgs, string>;
  [Actions.SAVE]: ArgRes<ArgSave, undefined>;
  [Actions.SAVE_CONTAINERS]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SAVE_SOLVERS]: ArgRes<PostMessageArgs, undefined>;
  [Actions.OPEN]: ArgRes<PostMessageArgs, undefined>;
  [Actions.RESTORE]: ArgRes<ArgsRestore, undefined>;
  [Actions.RESTORE_CONTAINERS]: ArgRes<ArgRestoreContainers, undefined>;
  [Actions.RESTORE_SOLVERS]: ArgRes<ArgRestoreSolvers, undefined>;
  [Actions.RENDERER_SHOULD_CHANGE_BACKGROUND]: ArgRes<ArgBackground, undefined>;
  [Actions.RENDERER_SHOULD_CHANGE_FOG_COLOR]: ArgRes<ArgColor<string>, undefined>;
  [Actions.TOGGLE_CAMERA_ORTHO]: ArgRes<PostMessageArgs, undefined>;
  [Actions.FOCUS_ON_SELECTED_OBJECTS]: ArgRes<PostMessageArgs, undefined>;
  [Actions.FOCUS_ON_CURSOR]: ArgRes<PostMessageArgs, undefined>;
  [Actions.LOOK_ALONG_AXIS]: ArgRes<ArgOrientationAxis, undefined>;
  [Actions.TOGGLE_RENDERER_STATS_VISIBLE]: ArgRes<PostMessageArgs, undefined>;
  [Actions.GET_RENDERER_STATS_VISIBLE]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SET_OBJECT_VIEW]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SHOW_TOAST]: ArgRes<ArgToast, undefined>;
  [Actions.SHOW_NEW_WARNING]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SHOW_OPEN_WARNING]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SHOW_TERMINAL]: ArgRes<PostMessageArgs, undefined>;
  [Actions.TOGGLE_TERMINAL]: ArgRes<PostMessageArgs, undefined>;
  [Actions.OPEN_MATERIAL_SEARCH]: ArgRes<ArgOpenMaterialDrawer, undefined>;
  [Actions.SHOW_SETTINGS_DRAWER]: ArgRes<PostMessageArgs, undefined>;
  [Actions.TOGGLE_MATERIAL_SEARCH]: ArgRes<PostMessageArgs, undefined>;
  [Actions.UPDATE_CHART_DATA]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SHOW_IMPORT_DIALOG]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SHOW_SAVE_DIALOG]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SHOW_SAVE_DIALOG_THEN_OPEN]: ArgRes<PostMessageArgs, undefined>;
  [Actions.GUTTER_SHOULD_UPDATE]: ArgRes<PostMessageArgs, undefined>;
  [Actions.SET_RENDERER_SHOULD_ANIMATE]: ArgRes<ArgAnimate, undefined>;
  [Actions.ADD_SELECTED_OBJECTS_TO_GLOBAL_VARIABLES]: ArgRes<PostMessageArgs, undefined>;
  [Actions.STATS_SETUP]: ArgRes<ArgStats, undefined>;
  [Actions.STATS_UPDATE]: ArgRes<ArgStats, undefined>;

  [Actions.NULL]: ArgRes<PostMessageArgs, undefined>;
  
  [Actions.CLEAR_LOCAL_STORAGE]: ArgRes<PostMessageArgs, undefined>;
      
    
  
  
  
}


type CollectType = {
  $collect: true;
};

export type EventArguments = any;

export type EventHandler = (e: PostMessageMap[keyof PostMessageMap]["args"]) => any;

export type EventListenerCallback = (...args) => void;

export class Messenger {
  private dictionaryMap: Map<StateAction, Map<string, EventHandler>>;
  private messageListeners: KVP<EventHandler>;
  lastMessage: StateAction;
  constructor() {
    this.dictionaryMap = new Map<StateAction, Map<string, EventHandler>>();
    this.messageListeners = {};
    this.lastMessage = Actions.NULL;
  }
  addMessageHandler<K extends keyof PostMessageMap>(
    message: K,
    handler: (e: PostMessageMap[K]["args"]) => any
  ): [string, string] {
    const id = uuid();
    if (!this.dictionaryMap.has(message)) {
      const handlerMap = new Map<string, EventHandler>();
      handlerMap.set(id, handler);
      this.dictionaryMap.set(message, handlerMap);
      return [message, id];
    } else {
      this.dictionaryMap.get(message)!.set(id, handler);
      return [message, id];
    }
  }
  removeMessage(message: StateAction) {
    if (this.dictionaryMap.has(message)) {
      this.dictionaryMap.delete(message);
    }
  }
  removeMessageHandler(message: StateAction, id: string) {
    if (this.dictionaryMap.has(message)) {
      if (this.dictionaryMap.get(message)!.has(id)) {
        this.dictionaryMap.get(message)!.delete(id);
      }
    }
  }
  postMessage<K extends keyof PostMessageMap>(
    message: K,
    args?: PostMessageMap[K]["args"]
  ): PostMessageMap[K]["res"] | undefined {
    if (message !== this.lastMessage) {
      this.lastMessage = message;
      // console.log(message);
    }

    if (this.dictionaryMap.has(message)) {
      let res: PostMessageMap[K]["res"] = {} as PostMessageMap[K]["res"];
      this.dictionaryMap.get(message)!.forEach((handler, key) => {
        res = handler(args!);
      });
      return res;
    }
    return undefined;
  }
  addMessageListener(callback: EventListenerCallback) {
    const id = uuid();
    this.messageListeners[id] = callback;
  }
  removeMessageListener(id) {
    if (this.messageListeners[id]) {
      delete this.messageListeners[id];
    }
  }
}

export default Messenger;
