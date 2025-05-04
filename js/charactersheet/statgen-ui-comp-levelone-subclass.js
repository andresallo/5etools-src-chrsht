import { StatGenUiRenderLevelOneEntityBase } from "./statgen-ui-comp-levelone-entitybase.js";

export class StatGenUiRenderLevelOneSubclass extends StatGenUiRenderLevelOneEntityBase {
    _title = "Subclass";
    _titleShort = "Subclass";
    _propIxEntity = "common_ixSubclass";
    _propIxAbilityScoreSet = "common_ixAbilityScoreSetSubclass";
    _propData = "_subclasses";
    _propModalFilter = "_modalFilterSubclasses";
    _propIsPreview = "common_isPreviewSubclass";
    _propEntity = "subclass";
    _page = UrlUtil.PG_CLASSES;
    _propChoiceMetasFrom = "common_subclassChoiceMetasFrom";
    _propChoiceWeighted = "common_subclassChoiceMetasWeighted";

    render() {
        const out = super.render();

        //TODO:Filtrar subclases
        const $dispSubClassDetails = this._$getSubclassDetails();

        // Habilita y vista
        const hkSubclassDetailsVisibility = () => {
            const isVisible = this._parent._state[this._propIsPreview];
            $dispSubClassDetails.toggleVe(isVisible);
        };

        this._parent._addHookBase(this._propIsPreview, hkSubclassDetailsVisibility);
        hkSubclassDetailsVisibility();

        out.$dispSubclassDetails = $dispSubClassDetails;
        out.$wrpOutersub = out.$wrpOuter;
        out.$stgSelsub = out.$stgSel;
        out.$hrPreviewsub = out.$hrPreview;

        return out;
    }

    _pb_getAbilityList() {
        return this._parent._pb_getSubclassAbilityList();
    }

    _pb_getAbility() {
        return this._parent._pb_getSubclassAbility();
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
        this._parent._addHookBase("common_isShowSubclassDetails", hkPreview);
        return out;
    }

    _getHkPreview({ $hrPreview }) {
        return () => $hrPreview.toggleVe(this._parent._state[this._propIsPreview]);
    }

    _$getSubclassDetails() {
        const $dispSubclassDetails = $(`<div class="ve-flex-col"><div class="italic ve-muted">Loading...</div></div>`);

        const renderSubclassDetails = (subcls, level) => {
            const subclsCopy = { ...subcls };

            subclsCopy.subclassFeatures = subcls.subclassFeatures?.map(features =>
                features.filter(feature => feature.level <= level)
            ) || [];

            const renderedContent = Renderer.hover.$getHoverContent_stats(UrlUtil.PG_CLASSES, subclsCopy);

            $dispSubclassDetails.empty().append(renderedContent);
        };

        const loadSubclassData = () => {
            const selectedSubclassIndex = this._parent._state[this._propIxEntity];
            const selectedSubclass = this._parent[this._propData]?.[selectedSubclassIndex];

            if (!selectedSubclass) {
                console.warn("No subclass selected or invalid selection.");
                $dispSubclassDetails.empty().append(`<div class="italic ve-muted">Please select a subclass.</div>`);
                return;
            }

            renderSubclassDetails(selectedSubclass, this._parent._state.common_classCount || 1);

            // DataLoader.pCacheAndGet(
            //     UrlUtil.PG_CLASSES,
            //     selectedSubclass.source,
            //     UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({ name: selectedSubclass.name, source: selectedSubclass.source })
            // )
            //     .then(subcls => {
            //         renderSubclassDetails(subcls, this._parent._state.common_classCount || 1);
            //     })
            //     .catch(err => {
            //         console.error("Error loading subclass data:", err); // Manejo de errores
            //     });
        };

        const hkSubclassCount = () => {
            const level = this._parent._state.common_classCount || 1;
            loadSubclassData();
        };

        const hkSelectedSubclass = () => {
            loadSubclassData();
        };

        this._parent._addHookBase("common_classCount", hkSubclassCount);
        this._parent._addHookBase(this._propIxEntity, hkSelectedSubclass);

        loadSubclassData();

        return $dispSubclassDetails;
    }
}