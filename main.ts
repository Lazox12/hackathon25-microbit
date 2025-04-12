namespace hackathon {
    function calculateAverage(arr: number[]) {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum / arr.length;
    }

    class Robot {
        limitLow: number[] = [60,0,70,30,0,0]
        limitHigh: number[] = [180,110,180,140,0,180]
        homePos:number[] = [130,60,60,30,0,180]
        inverse: number[] = [0,0,1,1,0,0]
        x: number
        y: number
        z: number
        address: number
        speedMultiplyer: number
        delay: number
        angles: number[] = [];
        constructor(address: number = 64, speedMultiplyer: number = 0.5, delay: number = 100) {
            this.speedMultiplyer = speedMultiplyer;
            this.delay = delay;
            this.address = address;
            
            this.home()
            
        }
        public home(){
            this.homeAxis(2)
            this.homeAxis(3)
            this.homeAxis(4)
            this.homeAxis(1)
            this.homeAxis(6)
        }
        public homeAxis(axis:number){
            robot.setAngle(axis,this.homePos[axis])
            basic.pause(100)
        }
        public move(x: number, y: number, z: number) {
            this.x, this.y, this.z = x, y, z;
            const a = 125.6 //délka první část
            const b = 177 //délka druhé části
            const o = 30 //offset středu soustavy oproti středu robota
            const p = 69.5 //výška postavy oproti pracovní ploše
            const e = 165  //vzálenost POI od posedního kloubu
            const c = Math.sqrt((x ** 2) + ((o - y) ** 2) + ((z + e - p) ** 2));
            //console.log(c)

            const r1 = Math.atan(((-1) * x) / (o - y)) / (2 * Math.PI) * 360;

            const r2a = Math.acos(Math.sqrt((x ** 2) + ((o - y) ** 2)) / c);
            const r2b = Math.acos(((a ** 2) + (c ** 2) - (b ** 2)) / (2 * a * c))
            //console.log(r2a, r2b)
            let r2 = 0
            if ((z + e - p) > 0) {
                r2 = r2b + r2a;
            } else {
                r2 = r2b - r2a;
            }
            r2 = r2 / (2 * Math.PI) * 360;

            const r3 = Math.acos(((a ** 2) + (b ** 2) - (c ** 2)) / (2 * a * b)) / (2 * Math.PI) * 360;

            const r4 = r2 + r3 - 90;

            const r5 = (-1) * r1;


            function checkValues(): boolean {
                if (c >= a + b) {
                    console.log('Bod je mimo dosah!')
                    return false
                }

                if (r1 > 90 || r1 < -90) {
                    console.log('Bod je mimo pracovní plochu!')
                    return false
                }

                if (r2 > 90 || r2 < 0 || r3 > 180 || r3 < 0) {
                    console.log('Neplatné úhly kloubů!')
                    return false
                }
                return true
            }
            if (!checkValues()) {
                return
            }
            setAngle(0, r1);
            setAngle(1, r2);
            setAngle(2, r3);
            setAngle(3, r4);
            setAngle(4, r5);
        }
        public setAngle(servo: number, target: number) {
            if (target < this.limitLow[servo]) {
                target = this.limitLow[servo]
            }
            if (target > this.limitHigh[servo]) {
                target = this.limitHigh[servo]
            }
            let lastAngle: number = this.angles[servo as number];
            this.angles[servo as number] = target;
            if (this.speedMultiplyer == 1) {
                PCA9685.setServoPosition(servo as number, target, 64);
                return;
            }
            const itnum: number = (Math.round(1 - this.speedMultiplyer) * 100 + 1);
            let angle: number = (lastAngle - target) / itnum;
            for (let j: number = 0; j < itnum; j++) {
                PCA9685.setServoPosition(servo as number, angle++, 64);
                basic.pause(this.delay);
            }
        }
    }

    //% fixedInstance
    export let robot: Robot = new Robot();
    //% block="přemístit se do|x:$x|y:$y|z:$z"
    export function move(x: number, y: number, z: number) {
        robot.move(x, y, z);
    }
    //% block="nastavit ůhel serva |servo:$servo|angle:$angle"
    export function setAngle(servo: number, angle: number) {
        robot.setAngle(servo, angle);
    }
    //% block="x"
    export function x(): number {
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
    //% block="získat úhel|servo: $servo"
    export function getAngle(servo: number): number {
        return robot.angles[servo as number];
    }
    //% block="nastavit i2c adresu|address: $address"
    export function setAddress(address: number) {
        robot.address = address;
    }
    //% block="nastavit rychlost robota|speed: $speed"
    //% v.min=0 v.max=1 v.defl=1
    export function setSpeed(speed: number) {
        robot.speedMultiplyer = speed;
    }
    //% block="detekce kostky"
    export function detectPickup(): boolean {
        if (pins.analogReadPin(AnalogPin.P0) < 900) {
            return true
        }
        return false
    }
    //% block="detekce chytnutí"
    export function detectCurrent(): boolean {
        if (pins.analogReadPin(AnalogPin.P1) < 650) {
            return true
        }
        return false
    }

    //% block="uchyť kostku"
    export function grabCube() {
        robot.setAngle(6, 128)
        basic.pause(100)
        let k = 128
        let avr: number[] = [];
        while (k >= 0) {
            robot.setAngle(6, k--)
            avr.push(pins.analogReadPin(AnalogPin.P1));
            if (avr.length > 20) {
                avr.removeAt(0);
            }
            let avrCurrent = calculateAverage(avr);
            serial.writeNumber(avrCurrent);
            serial.writeLine("")
            if (avrCurrent > 650) {
                break;
            };

            basic.pause(10)
        }
    }
    //% block="pusť kostku"
    export function releaseCube(){
        robot.setAngle(6, 128)
    }
    //% block="kalibrační pozice"
    export function GoToHome(){
        for(let i = 0;i<6;i++){
            robot.setAngle(i,robot.homePos[i])
        }
    }
}
