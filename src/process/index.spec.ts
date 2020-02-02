import { ProcessManager } from './process-manager';
import { Process } from './process';
import { Task } from './task';



const proc = new Process({
  name: "some proc", steps: [
    new Task({
      name: "select-surface",
      desc: "select a surface",
      complete: (...args) => true
    })
  ]
})

