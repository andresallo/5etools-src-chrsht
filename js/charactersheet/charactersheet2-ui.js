import {StatGenUiRenderLevelOneClass} from "./statgen-ui-comp-levelone-class.js";
import {StatGenUiRenderLevelOneRace} from "./statgen-ui-comp-levelone-race.js";
import {MAX_CUSTOM_FEATS, MODE_NONE} from "./statgen-ui-consts.js";

export class StatGenUi extends BaseComponent {
    static _MODES = [
        "class",
        "race",
    ];

    static _MODES_FVTT = [
            MODE_NONE,
            ...this._MODES,
    ];

    constructor(opts) {
        super();
        opts = opts || {};

        this._races = opts.races;
		this._backgrounds = opts.backgrounds;
		this._feats = opts.feats;
		this._classes = (opts.classes || []).filter(cls => cls.__prop === "class");
		this._tabMetasAdditional = opts.tabMetasAdditional;
		this._isCharacterMode = opts.isCharacterMode;
		this._isFvttMode = opts.isFvttMode;

        this._MODES = this._isFvttMode ? StatGenUi._MODES_FVTT : StatGenUi._MODES;

        this._modalFilterRaces = opts.modalFilterRaces || new ModalFilterRaces({namespace: "statgen.races", isRadio: true, allData: this._races});
        this._modalFilterClasses = opts.modalFilterClasses || new ModalFilterClasses({namespace: "statgen.classes", isRadio: true, allData: this._classes});

        this._state = {
            ixActiveTab: 0, // Default to the first mode (class)
        };

        this.__hooksActiveTab = [];
        this.__hooksState = {};
    }

    _renderLevelOneClass = new StatGenUiRenderLevelOneClass({parent: this});
    _renderLevelOneRace = new StatGenUiRenderLevelOneRace({parent: this});

    get race () { return this._races[this._state.common_ixRace]; }
	get MODES () { return this._MODES; }

    async pInit() {
        await this._modalFilterRaces.pPopulateHiddenWrapper();
        await this._modalFilterClasses.pPopulateHiddenWrapper();
    }

    get ixActiveTab() {
        return this._state.ixActiveTab;
    }

    set ixActiveTab(val) {
        if (this._state.ixActiveTab === val) return;
        this._state.ixActiveTab = val;

        // Trigger hooks for active tab change
        if (this.__hooksActiveTab) {
            this.__hooksActiveTab.forEach(hook => hook(val));
        }
    }

    addHookActiveTab(hook) {
        this.__hooksActiveTab.push(hook);
    }

    addHookActiveTag (hook) { this.addHookActiveTab(hook); }

    addHookAll(prop, hook) {
        if (!this.__hooksState[prop]) this.__hooksState[prop] = [];
        this.__hooksState[prop].push(hook);
    }

    _triggerHooks(prop) {
        if (this.__hooksState[prop]) {
            this.__hooksState[prop].forEach(hook => hook(this._state[prop]));
        }
    }

    getSaveableState() {
        return {
            state: {...this._state},
        };
    }

	_pb_getRaceAbilityList () {
		const race = this.race;
		if (!race?.ability?.length) return null;

		return race.ability
			.map(fromRace => {
				if (
					this._state.common_isTashas
					&& this._state.common_isAllowTashasRules
				) {
					const weights = [];

					if (fromRace.choose && fromRace.choose.weighted && fromRace.choose.weighted.weights) {
						weights.push(...fromRace.choose.weighted.weights);
					}

					Parser.ABIL_ABVS.forEach(it => {
						if (fromRace[it]) weights.push(fromRace[it]);
					});

					if (fromRace.choose && fromRace.choose.from) {
						const count = fromRace.choose.count || 1;
						const amount = fromRace.choose.amount || 1;
						for (let i = 0; i < count; ++i) weights.push(amount);
					}

					weights.sort((a, b) => SortUtil.ascSort(b, a));

					fromRace = {
						choose: {
							weighted: {
								from: [...Parser.ABIL_ABVS],
								weights,
							},
						},
					};
				}

				return fromRace;
			});
	}

    _pb_getRaceAbility () {
		return this._pb_getRaceAbilityList()?.[this._state.common_ixAbilityScoreSetRace || 0];
	}

_pb_getClassAbilityList() {
    const cls = this._classes[this._state.common_ixClass];
    if (!cls?.ability?.length) return null;

    return cls.ability.map(fromClass => {
        if (
            this._state.common_isTashas &&
            this._state.common_isAllowTashasRules
        ) {
            const weights = [];

            if (fromClass.choose && fromClass.choose.weighted && fromClass.choose.weighted.weights) {
                weights.push(...fromClass.choose.weighted.weights);
            }

            Parser.ABIL_ABVS.forEach(it => {
                if (fromClass[it]) weights.push(fromClass[it]);
            });

            if (fromClass.choose && fromClass.choose.from) {
                const count = fromClass.choose.count || 1;
                const amount = fromClass.choose.amount || 1;
                for (let i = 0; i < count; ++i) weights.push(amount);
            }

            weights.sort((a, b) => SortUtil.ascSort(b, a));

            fromClass = {
                choose: {
                    weighted: {
                        from: [...Parser.ABIL_ABVS],
                        weights,
                    },
                },
            };
        }

        return fromClass;
    });
}

_pb_getClassAbility() {
    return this._pb_getClassAbilityList()?.[this._state.common_ixAbilityScoreSetClass || 0];
}

    setStateFrom(saved, isOverwrite = false) {
        if (isOverwrite) {
            this._state = {...saved.state};
        } else {
            Object.assign(this._state, saved.state);
        }

        // Trigger hooks for all state properties
        Object.keys(this._state).forEach(prop => this._triggerHooks(prop));
    }

    doResetAll() {
        this._state = {
            ixActiveTab: 0,
        };

        // Trigger hooks for reset state
        Object.keys(this._state).forEach(prop => this._triggerHooks(prop));
    }

    render($parent) {
        $parent.empty().addClass("statgen");

        const $wrpAll = $(`<div class="ve-flex-col w-100 h-100"></div>`);

        // Render Class tab
        const { $stgSel: $stgClassSel, $dispPreview: $dispPreviewClass } = this._renderLevelOneClass.render();
        const $tabClass = $$`<div class="ve-flex-col w-100 h-100">
            <h4>Clase</h4>
            ${$stgClassSel}
            ${$dispPreviewClass}
        </div>`;

        // Render Race tab
        const { $stgSel: $stgRaceSel, $dispPreview: $dispPreviewRace } = this._renderLevelOneRace.render();
        const $tabRace = $$`<div class="ve-flex-col w-100 h-100">
            <h4>Raza</h4>
            ${$stgRaceSel}
            ${$dispPreviewRace}
        </div>`;

        // Append tabs to the wrapper
        $wrpAll.append($tabClass.hide());
        $wrpAll.append($tabRace.hide());

        // Hook to switch tabs based on the active mode
        const hkTab = () => {
            $tabClass.toggle(this.ixActiveTab === 0); // Show Class tab
            $tabRace.toggle(this.ixActiveTab === 1); // Show Race tab
        };
        this.addHookActiveTab(hkTab);
        hkTab();

        $parent.append($wrpAll);
    }
}