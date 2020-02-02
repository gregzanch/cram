import { Process } from './process';
import { KeyValuePair } from '../common/key-value-pair';
import Messenger from '../messenger';

export interface ProcessManagerParams {
  
  messenger: Messenger;
  processes?: KeyValuePair<Process>;
  
}

export interface RegisterProcessParams{
  proc: Process;
  
}

export class ProcessManager{
  public currentProcess!: Process;
  public messenger: Messenger;
  public processes: KeyValuePair<Process>
  constructor(params: ProcessManagerParams) {
    this.messenger = params.messenger;
    this.processes = params.processes || {} as KeyValuePair<Process>;
  }
  registerNewProcess(params: RegisterProcessParams) {
    if (this.processes[params.proc.id]) {
      console.error("Process already registered under id: " + params.proc.id);
    }
    else {
      this.processes[params.proc.id] = params.proc;
    }
  }
}
