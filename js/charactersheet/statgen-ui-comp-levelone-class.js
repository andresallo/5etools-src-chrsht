import { StatGenUiRenderLevelOneEntityBase } from "./statgen-ui-comp-levelone-entitybase.js";

export class StatGenUiRenderLevelOneClass extends StatGenUiRenderLevelOneEntityBase {
    _title = "Class";
    _titleShort = "Class";
    _propIxEntity = "common_ixClass";
    _propIxAbilityScoreSet = "common_ixAbilityScoreSetClass";
    _propData = "_classes";
    _propModalFilter = "_modalFilterClasses";
    _propIsPreview = "common_isPreviewClass";
    _propEntity = "class";
    _page = UrlUtil.PG_CLASSES;
    _propChoiceMetasFrom = "common_classChoiceMetasFrom";
    _propChoiceWeighted = "common_classChoiceMetasWeighted";

    render() {
        const out = super.render();

        //TODO: No se funciona el boton de filtro cuando se selecciona una clase
        const {$stgClassControls, $dispClassDetails } = this._$getClassControls();

        //Habilita y vista
        const hkClassDetailsVisibility = () => {
            const isVisible = this._parent._state[this._propIsPreview];
            $dispClassDetails.toggleVe(isVisible);
        };
        
        this._parent._addHookBase(this._propIsPreview, hkClassDetailsVisibility);
        hkClassDetailsVisibility(); 

        $stgClassControls.append(out.$stgSel);

        out.$stgSel = $stgClassControls;
        out.$dispClassDetails = $dispClassDetails;

        return out;
    }

    _pb_getAbilityList() {
        return this._parent._pb_getClassAbilityList();
    }

    _pb_getAbility() {
        return this._parent._pb_getClassAbility();
    }

    _bindAdditionalHooks_hkIxEntity(hkIxEntity) {
        this._parent._addHookBase("common_isTashas", hkIxEntity);
        this._parent._addHookBase("common_isAllowTashasRules", hkIxEntity);
    }

    _bindAdditionalHooks_hkSetValuesSelAbilitySet(hkSetValuesSelAbilitySet) {
        this._parent._addHookBase("common_isTashas", hkSetValuesSelAbilitySet);
        this._parent._addHookBase("common_isAllowTashasRules", hkSetValuesSelAbilitySet);
    }

    _getHrPreviewMeta() {
        const out = super._getHrPreviewMeta();
        const { hkPreview } = out;
        this._parent._addHookBase("common_isShowClassDetails", hkPreview);
        return out;
    }

    _getHkPreview({ $hrPreview }) {
        return () => $hrPreview.toggleVe(this._parent._state[this._propIsPreview]);
    }

    _$getClassControls() {
        const { ipt: $iptClassCount, wrp: $wrpClassCount } = ComponentUiUtil.getIptInt(
            this._parent,
            "common_classCount",
            1,
            {
                min: 1,
                max: 20,
                asMeta: true,
                decorationLeft: "spacer",
                decorationRight: "ticker",
            },
        );
        $iptClassCount.removeClass("ve-text-right").addClass("ve-text-center");
        $wrpClassCount.classList.add("w-100p", "ml-2");

        const $dispClassDetails = $(`<div class="ve-flex-col"><div class="italic ve-muted">Loading...</div></div>`);

        const renderClassDetails = (cls, level) => {
            const clsCopy = { ...cls };
        
            clsCopy.classFeatures = cls.classFeatures?.map(features =>
                features.filter(feature => feature.level <= level)
            ) || [];
                
            const renderedContent = Renderer.hover.$getHoverContent_stats(UrlUtil.PG_CLASSES, clsCopy);

            $dispClassDetails.empty().append(renderedContent);
        };

        const loadClassData = () => {
            const selectedClassIndex = this._parent._state[this._propIxEntity];
            const selectedClass = this._parent[this._propData]?.[selectedClassIndex];

            if (!selectedClass) {
                console.warn("No class selected or invalid selection.");
                $dispClassDetails.empty().append(`<div class="italic ve-muted">Please select a class.</div>`);
                return;
            }

            renderClassDetails(selectedClass, this._parent._state.common_classCount || 1);
            // DataLoader.pCacheAndGet(
            //     UrlUtil.PG_CLASSES,
            //     selectedClass.source,
            //     UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({ name: selectedClass.name, source: selectedClass.source })
            // )
            //     .then(cls => {
            //         renderClassDetails(cls, this._parent._state.common_classCount || 1);
            //     })
            //     .catch(err => {
            //         console.error("Error loading class data:", err); // Manejo de errores
            //     });
        };

        const hkClassCount = () => {
            const level = this._parent._state.common_classCount || 1;
            loadClassData();
        };

        const hkSelectedClass = () => {
            loadClassData();
        };

        this._parent._addHookBase("common_classCount", hkClassCount);
        this._parent._addHookBase(this._propIxEntity, hkSelectedClass);

        loadClassData();

        const $stgClassControls = $$`<div class="ve-flex-col w-100">
            <div class="ve-flex mt-2">
                <div class="mr-2">Level of Class</div>
                ${$wrpClassCount} <!-- Selector de números -->
            </div>
        </div>`;

        return {
            $stgClassControls,
            $dispClassDetails,
        };
    }
    
}