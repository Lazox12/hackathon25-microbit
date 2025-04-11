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
        speedMultiplyer:number
        delay:number
        angles:number[] = []; 
        constructor(address:number = 64,speedMultiplyer:number = 1,delay:number = 100) {
            this.speedMultiplyer = speedMultiplyer;
            this.delay = delay;
            this.address = address;
        }
        public move(x: number, y: number, z: number) {
            this.x,this.y,this.z = x,y,z;
        }
        public setAngle(servo: ServoNum, target: number) {
            let lastAngle: number = this.angles[servo as number];
            this.angles[servo as number] = target;
            if(this.speedMultiplyer ==1){
                PCA9685.setServoPosition(servo as number, target, 64);
                return;
            }
            const itnum:number = (Math.round(1-this.speedMultiplyer)*100+1);
            let angle:number = (lastAngle-target)/itnum;
            for(let i:number=0;i<itnum;i++){
                PCA9685.setServoPosition(servo as number, angle++, 64);
                basic.pause(this.delay);
            }
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
    //% block="set i2c address|address: $address"
    export function setAddress(address:number){
        robot.address = address;
    }
    //% block="set robot speed|speed: $speed"
    //% v.min=0 v.max=1 v.defl=1
    export function setSpeed(speed: number) {
        robot.speedMultiplyer = speed;
    }
}
