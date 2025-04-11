namespace hackathon {
    class Robot {

        constructor() {

        }
        public move(x: number, y: number, z: number) {

        }
        public setAngle(servo: number, angle: number) {

        }
    }

    //% fixedInstance
    export let robot: Robot = new Robot();
    //% block="move to|x:$x|y:$y|z:$z"
    export function move(x:number,y:number,z:number) {
        robot.move(x,y,z);
    }
    //% block="set servo angle|servo:$servo|angle:$angle"
    export function setAngle(servo:number,angle:number){
        robot.setAngle(servo,angle);
    }
}

