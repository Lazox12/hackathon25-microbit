enum ServoNum{
    ServoNum0 = 0,
    ServoNum1 = 1,
    ServoNum2 = 2,
    ServoNum3 = 3,
    ServoNum4 = 4,
    ServoNum5 = 5
}
namespace hackathon {
    class Robot {
        x:number
        y:number
        z:number
        address:number
        angles:number[] = []; 
        constructor(address = 64) {
            this.address = address;
        }
        public move(x: number, y: number, z: number) {
            this.x,this.y,this.z = x,y,z;
        }
        public setAngle(servo: ServoNum, angle: number) {
            this.angles[servo as number] = angle;
            PCA9685.setServoPosition(servo as number, angle, 64);
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
    //% block="x"
    export function x():number{
        return robot.x;
    }
    //% block="y"
    export function y(): number {
        return robot.y;
    }
    //% block="x"
    export function z(): number {
        return robot.z;
    }
    //% block="get angle|servo: $servo"
    export function getAngle(servo:ServoNum):number{
        return robot.angles[servo as number];
    }
}
