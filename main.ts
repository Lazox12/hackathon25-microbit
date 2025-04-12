enum ServoNum {
    ServoNum0 = 0,
    ServoNum1 = 1,
    ServoNum2 = 2,
    ServoNum3 = 3,
    ServoNum4 = 4,
    ServoNum5 = 5
}

namespace hackathon {
    function calculateAverage(arr: number[]) {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum / arr.length;
    }

    class Robot {
        x: number
        y: number
        z: number
        address: number
        speedMultiplyer: number
        delay: number
        angles: number[] = [];
        constructor(address: number = 64, speedMultiplyer: number = 1, delay: number = 100) {
            this.speedMultiplyer = speedMultiplyer;
            this.delay = delay;
            this.address = address;
        }
        public move(x: number, y: number, z: number) {
            this.x, this.y, this.z = x, y, z;
            const a = 30 //délka první část
            const b = 20 //délka druhé části
            const o = 30 //offset středu soustavy oproti středu robota
            const p = 10 //výška postavy oproti pracovní ploše
            const e = 5  //vzálenost POI od posedního kloubu
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
        public setAngle(servo: ServoNum, target: number) {
            let lastAngle: number = this.angles[servo as number];
            this.angles[servo as number] = target;
            if (this.speedMultiplyer == 1) {
                PCA9685.setServoPosition(servo as number, target, 64);
                return;
            }
            const itnum: number = (Math.round(1 - this.speedMultiplyer) * 100 + 1);
            let angle: number = (lastAngle - target) / itnum;
            for (let i: number = 0; i < itnum; i++) {
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
    export function getAngle(servo: ServoNum): number {
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
    export function detectCurrent():boolean {
        if (pins.analogReadPin(AnalogPin.P1) < 650) {
            return true
        }
        return false
    }

    //% block="uchyť kostku"
    export function grabCube(){
        robot.setAngle(5, 128)
        basic.pause(100)
        let i = 128
        let avr: number[] = [];
        while (i>=0) {
            robot.setAngle(5, i--)
            avr.push(pins.analogReadPin(AnalogPin.P1));
            if (avr.length > 20) {
                avr.removeAt(0);
            }
            let avrCurrent = calculateAverage(avr);
            if (avrCurrent >650){
                break;
            };
            serial.writeNumber(avrCurrent);
            serial.writeLine("")
            basic.pause(10)
        }
        while (true) {
            serial.writeLine("aa")
        }

    }
}
