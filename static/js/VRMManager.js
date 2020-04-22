class VRMManager {
    constructor(currentVrm) {
        this.vrm = currentVrm;
        this.tweens = {};
    }

    rotation(part) {
        return this.vrm.humanoid.getBoneNode(part).rotation;
    }

    setPreset(preset, value) {
        this.vrm.blendShapeProxy.setValue(preset, value);
    }

    tween(current, target, update, name, reset = null, setDuration = 20, resetDuration = 200, resetDelay = 500) {
        const resetName = name + "Reset";
        if (this.tweens[name]) {
            this.tweens[name].stop();
            if (reset) this.tweens[resetName].stop();
        }

        this.tweens[name] = new TWEEN.Tween(current).to(target, setDuration).easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => update())
        
        if (reset) {
            this.tweens[name].chain(this.tweens[resetName] = new TWEEN.Tween(current).to(reset, resetDuration).easing(TWEEN.Easing.Linear.None)
                .onUpdate(() => update()).delay(resetDelay))
        }

        this.tweens[name].start();
    }
}

const Bone = THREE.VRMSchema.HumanoidBoneName;
const Preset = THREE.VRMSchema.BlendShapePresetName;