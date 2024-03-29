sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "../js/TableFilter",
    "../js/TableValueHelp",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],

function (Controller, JSONModel, MessageBox, History, MessageToast, TableFilter, TableValueHelp, Filter, FilterOperator) {
    var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "MM/dd/yyyy" });
    var sapDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });
    
    return Controller.extend("zuiaprocess.controller.CreatePO", {

        onInit: function() {
            const route = this.getOwnerComponent().getRouter().getRoute("RouteCreatePO");
            route.attachPatternMatched(this.onPatternMatched, this);
            
            var me = this;

            if (sap.ui.getCore().byId("backBtn") !== undefined) {
                sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = function(oEvent) {
                    me.onNavBack();
                }
            }

            var oEventDelegate = {
                onclick: function(oEvent) {
                    me.showGeneratePOGroups();
                }
            };

            this.byId("titlePOCreate").addEventDelegate(oEventDelegate);
            this._tableValueHelp = TableValueHelp; 

            // var oInputEventDelegate = {
            //     onkeydown: function(oEvent){
            //         me.onInputKeyDown(oEvent);
            //     },
            // };

            // this.byId("detailTab").getColumns().forEach(col => {
            //     if (col.getTemplate().getBindingInfo("value") !== undefined) {
            //         console.log(col.getTemplate())
            //         var oInput = col.getTemplate();
            //         oInput.addEventDelegate(oInputEventDelegate);
            //         col.setTemplate(oInput);
            //     }
            // })
        },
        
        onPatternMatched: function() {  
            var me = this;
            this._oModel = this.getOwnerComponent().getModel();
            this._aColumns = [];
            this._poCreated = false;
            this._toExtend = false;
            this._sActiveTable = "";
            this._headerTextDialog = false;
            this._changeDateDialog = false;
            this.showLoadingDialog('Processing...');
            
            if (sap.ui.getCore().byId("backBtn") !== undefined) {
                sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = function(oEvent) {
                    me.onNavBack();
                }
            }

            var vSBU = this.getOwnerComponent().getModel("UI_MODEL").getData().sbu;

            if (this.getView().getModel("payterms") !== undefined) this.getView().getModel("payterms").destroy();
            if (this.getView().getModel("header") !== undefined) this.getView().getModel("header").destroy();
            if (this.getView().getModel("detail") !== undefined) this.getView().getModel("detail").destroy();
            if (this.getView().getModel("remarks") !== undefined) this.getView().getModel("remarks").destroy();
            if (this.getView().getModel("packins") !== undefined) this.getView().getModel("packins").destroy();
            if (this.getView().getModel("fabspecs") !== undefined) this.getView().getModel("fabspecs").destroy();
            if (this.getView().getModel("potol") !== undefined) this.getView().getModel("potol").destroy();
            // var oJSONModelDtl = new JSONModel();

            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().shipmode), "shipmode");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().incoterm), "incoterm");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().supplyType), "supplyType");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().uom), "uom");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().payterm), "payterm");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().shipmode), "currency");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().incoterm), "company");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().supplyType), "plant");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().uom), "purchorg");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().payterm), "purchgrp");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("LOOKUP_MODEL").getData().payterm), "podoctyp");

            this._oModel.read("/IncoTermsSet", {
                success: function (oData, oResponse) {
                    me.getView().getModel("incoterm").setProperty("/", oData.results);
                },
                error: function (err) { }
            });      
            
            this._oModel.read("/SupplyTypeRscSet", {
                success: function (oData, oResponse) {
                    me.getView().getModel("supplyType").setProperty("/", oData.results);
                },
                error: function (err) { }
            });

            this._oModel.read("/UOMSet", {
                success: function (oData, oResponse) {
                    me.getView().getModel("uom").setProperty("/", oData.results);
                },
                error: function (err) { }
            });

            if (this.getView().getModel("grpheader") !== undefined) {
                console.log("grpheader")

                var oGrpHdrData = [{
                    COMPANY: "",
                    COMPANYDESC: "",
                    CURR: "",
                    CUSTGRP: "",
                    DESTINATION: "",
                    DOCTYPE: "",
                    DOCTYPEDESC: "",
                    EXRATE: "",
                    INCOTERMS: "",
                    PAYTERMS: "",
                    PURCHGRP: "",
                    PURCHGRPDESC: "",
                    PURCHORG: "",
                    PURCHORGDESC: "",
                    PURCHPLANT: "",
                    PURCHPLANTDESC: "",
                    SHIPMODE: "",
                    SHIPTOPLANT: "",
                    SHIPTOPLANTDESC: "",
                    VENDOR: "",
                    VENDORNAME: "",
                }]

                this.getView().setModel(new JSONModel(oGrpHdrData), "grpheader");
            }

            var oHeaderData = this.getOwnerComponent().getModel("CREATEPO_MODEL").getData().header;
            var oDataRem = {}, oDataPackIns = {}, oDataFabSpecs = {}; //, oDataPOTolerance = {};
            var aDataRemItems = [], aDataPackInsItems = [], aDataFabSpecsItems = [], aDataDocType = []; //, aDataPOTolerance = [];
            var iCounter = 0, iCounter2 = 0;
            var mData = {};

            if (oHeaderData[0].EXTEND) {
                this.byId("fldPAYTERMS").setEnabled(false);
                this.byId("fldINCOTERMS").setEnabled(false);
                this.byId("fldDESTINATION").setEnabled(false);
                this.byId("fldSHIPMODE").setEnabled(false);
                this.byId("btnHdrTxt").setVisible(false);
            }
            else {
                this.byId("fldPAYTERMS").setEnabled(true);
                this.byId("fldINCOTERMS").setEnabled(true);
                this.byId("fldDESTINATION").setEnabled(true);
                this.byId("fldSHIPMODE").setEnabled(true);
                this.byId("btnHdrTxt").setVisible(true);
            }

            if (oHeaderData.length === 1) {
                this.byId("btnCancelAllPO").setVisible(false);
            }
            else {
                this.byId("btnCancelAllPO").setVisible(true);
            }

            this._poNO = "";
            this._bFabSpecsChanged = false;
            this._bRemarksChanged = false;
            this._bPackInsChanged = false;
            this._bHeaderChanged = false;
            this._bDetailsChanged = false;
            this._columnUpdated = false;
            this._aRemarksDataBeforeChange = [];
            this._aPackInsDataBeforeChange = [];
            this._aFabSpecsDataBeforeChange = [];
            this._aHeaderDataBeforeChange = [];
            this._aDetailsDataBeforeChange = [];
            this._validationErrors = [];
            this._aCreatePOResult = [];
            this._oParamCPOTolData = [];
            this._oDataPOTolerance = {
                WEMNG: "0",
                FOCQTY: "0",
                TOLALLOWEDIT: "",
                QTYMIN: "0",
                QTYMAX: "0",
                UNTTOMIN: "0",
                UNTTOMAX: "0",
                UEBTOMIN: "0",
                UEBTOMAX: "0"
            };

            var oShipMode = this.getView().getModel("shipmode").getData();
            var vShipMode = oShipMode.length === 1 ? oShipMode[0].SHIPMODE : "";
            
            oHeaderData.forEach((item, idx) => {
                var oDataGroupDetail = this.getOwnerComponent().getModel("CREATEPO_MODEL").getData().detail.filter(fItem => fItem.GROUP === item.GROUP);

                item.PODATE = dateFormat.format(new Date());
                // item.PAYTERMS = "";
                // item.INCOTERMS = "";
                // item.DESTINATION = "";
                // item.CURR = "";
                item.EXRATE = "";
                item.SHIPMODE = item.EXTEND ? item.SHIPMODE : vShipMode;
                item.STATUS = "NEW";

                var sVendor = item.VENDOR;

                if (!isNaN(sVendor)) {
                    while (sVendor.length < 10) sVendor = "0" + sVendor;
                }

                me._oModel.read("/PayTermsSet", {
                    urlParameters: {
                        "$filter": "LIFNR eq '" + sVendor + "' and EKORG eq '" + item.PURCHORG + "'"
                    },
                    success: async function (oData, oResponse) {
                        iCounter++;                                
                        mData[item.GROUP] = oData.results;

                        oDataGroupDetail.forEach(dtl => {
                            if (dtl.INFOREC === "") { dtl.GRBASEDIV = oData.results[0].WEBRE }
                        });
                        
                        if (oData.results.length > 0) {
                            item.PAYTERMS = item.EXTEND ? item.PAYTERMS : oData.results[0].ZTERM;
                            item.INCOTERMS = item.EXTEND ? item.INCOTERMS : oData.results[0].INCO1;
                            item.DESTINATION = item.EXTEND ? item.DESTINATION :oData.results[0].INCO2;
                            item.CURR = item.EXTEND ? item.CURR :oData.results[0].WAERS;
                        }

                        if (item.GROUP === "1") {
                            me.getView().getModel("payterm").setProperty("/", oData.results);
                            me.getView().setModel(new JSONModel(oDataGroupDetail), "detail");
                            me.byId("detailTab").setModel(new JSONModel(oDataGroupDetail), "detail");
                            me.byId("detailTab").bindRows({path: "detail>/"});
                            await me.getColumnProp(me);
                        }

                        if (iCounter === oHeaderData.length) {
                            me.getView().setModel(new JSONModel(mData), "payterms");
                            me.getView().setModel(new JSONModel(oHeaderData), "header");
                            me.getView().setModel(new JSONModel(oHeaderData.filter(grp => grp.GROUP === "1")), "grpheader");
                            // me.closeLoadingDialog();
                        }                         
                    },
                    error: function (err) {
                        iCounter++;
                    }
                });

                aDataRemItems.push({
                    GROUP: item.GROUP,
                    ITEM: "1",
                    REMARKS: "",
                    STATUS: ""
                });

                oDataRem[item.GROUP] = aDataRemItems;

                aDataPackInsItems.push({
                    GROUP: item.GROUP,
                    ITEM: "1",
                    PACKINS: "",
                    STATUS: ""                    
                });

                oDataPackIns[item.GROUP] = aDataPackInsItems;

                aDataFabSpecsItems.push({
                    GROUP: item.GROUP,
                    EBELN: "",
                    EBELP: "00010",
                    ZZMAKT: "",
                    ZZHAFE: "",
                    ZZSHNK: "",
                    ZZCHNG: "",
                    ZZSTAN: "",
                    ZZDRY: "",
                    ZZCFWA: "",
                    ZZCFCW: "",
                    ZZSHRQ: "",
                    ZZSHDA: "",
                    PLANMONTH: oDataGroupDetail[0].PLANMONTH, //this.getView().getModel("detail").getData()[0].PLANMONTH,
                    ZZREQ1: "",
                    ZZREQ2: "",
                    STATUS: "NEW"                 
                });

                oDataFabSpecs[item.GROUP] = aDataFabSpecsItems;

                aDataRemItems = [], aDataPackInsItems = [], aDataFabSpecsItems = [];

                if (aDataDocType.filter(fItem => fItem.Podoctyp === item.DOCTYPE).length === 0) {
                    me._oModel.read("/PODocTypInfoSet('" + item.DOCTYPE + "')", {
                        success: function (oData, oResponse) {
                            iCounter2++;
                            aDataDocType.push(oData);

                            if (iCounter2 === oHeaderData.length) {
                                me.getView().setModel(new JSONModel(aDataDocType), "doctype");  
                            }
                        },
                        error: function (err) {
                            iCounter2++;
                        }
                    });
                }
                else iCounter2++;

                this._aCreatePOResult.push({
                    GROUP: item.GROUP,
                    VENDOR: item.VENDOR,
                    PURCHORG: item.PURCHORG,
                    PURCHGRP: item.PURCHGRP,
                    STATUS: "NEW",
                    REMARKS: item.EXTEND ? "For PO Extension" : "For PO Generation"
                })
            })

            // var oDataDetail = this.getOwnerComponent().getModel("CREATEPO_MODEL").getData().detail.filter(fItem => fItem.GROUP === "1");
            // this.getView().setModel(new JSONModel(oDataDetail), "detail");
            // this.byId("detailTab").setModel(new JSONModel(oDataDetail), "detail");
            // this.byId("detailTab").bindRows({path: "detail>/"});

            this.getView().setModel(new JSONModel(oDataRem), "remarks");
            this.getView().setModel(new JSONModel(oDataPackIns), "packins");            
            this.getView().setModel(new JSONModel(oDataFabSpecs), "fabspecs");
            this.getView().setModel(new JSONModel(this.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").getData().text), "ddtext");
            this.getOwnerComponent().getModel("UI_MODEL").setProperty("/flag", false);
            this.setFormInputValueHelp();
            this.getDiscRate();
            this.byId("btnPrevPO").setEnabled(false);

            this.getView().setModel(new JSONModel({
                today: dateFormat.format(new Date()),
                activeGroup: "1",
                totalGroup: oHeaderData.length + "",
                title: oHeaderData[0].EXTEND ? oHeaderData[0].PONO + " " + this.getView().getModel("ddtext").getData()["POEXTEND"] : this.getView().getModel("ddtext").getData()["POCREATE"],
                generatepo: oHeaderData[0].EXTEND ? this.getView().getModel("ddtext").getData()["EXTENDPO"] : this.getView().getModel("ddtext").getData()["GENERATEPO"],
                dataWrap: {
                    mainTab: false,
                    detailTab: false
                }
            }), "ui");

            if (oHeaderData.length > 1) { this.byId("btnNextPO").setEnabled(true); } 
            else { this.byId("btnNextPO").setEnabled(false); }
        },

        onNavBack: function(oEvent) {
            var oData = {
                Process: "po-cancel",
                Text: this.getView().getModel("ddtext").getData()["CONF_CANCEL_CREATEPO"]
            }

            if (!this._ConfirmDialog) {
                this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);

                this._ConfirmDialog.setModel(new JSONModel(oData));
                this.getView().addDependent(this._ConfirmDialog);
            }
            else this._ConfirmDialog.setModel(new JSONModel(oData));
                
            this._ConfirmDialog.open();

            this.getOwnerComponent().getModel("UI_MODEL").setProperty("/columnUpdate", this._columnUpdated);
            this.getOwnerComponent().getModel("UI_MODEL").setProperty("/columns", this._aColumns);
        },

        getColumnProp: async (me) => {
            var sPath = jQuery.sap.getModulePath("zuiaprocess", "/model/columns.json");

            var oModelColumns = new JSONModel();
            await oModelColumns.loadData(sPath);

            var oColumns = oModelColumns.getData();
            // me._aColumns = oModelColumns.getData();
            me._oModelColumns = oModelColumns.getData();

            var vColumnUpdated = me.getOwnerComponent().getModel("UI_MODEL").getData().columnUpdate;

            if (me.byId("detailTab").getColumns().length === 0 || vColumnUpdated) {
                console.log("get columns");
                me.getDynamicColumns("ANPCRTPO", "Z3DERP_ANPCRTPO", "detailTab", oColumns);
            }
            else {
                me.closeLoadingDialog();
                me._aColumns = me.getOwnerComponent().getModel("UI_MODEL").getData().columns;
                me.setRowEditMode("detail");
            }
            
            // me.setRowEditMode("detail");

            TableValueHelp.setFormSuggestion(me, "grpheader");
        },

        getDynamicColumns(arg1, arg2, arg3, arg4) {
            var me = this;
            var sType = arg1;
            var sTabName = arg2;
            var sTabId = arg3;
            var oLocColProp = arg4;
            var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");
            var vSBU = this.getOwnerComponent().getModel("UI_MODEL").getData().sbu;

            oModel.setHeaders({
                sbu: vSBU,
                type: sType,
                tabname: sTabName
            });

            oModel.read("/ColumnsSet", {
                success: function (oData, oResponse) {
                    if (oData.results.length > 0) {
                        if (oLocColProp[sTabId.replace("Tab", "")] !== undefined) {
                            oData.results.forEach(item => {
                                oLocColProp[sTabId.replace("Tab", "")].filter(loc => loc.ColumnName === item.ColumnName)
                                    .forEach(col => {
                                        item.ValueHelp = col.ValueHelp;
                                        item.TextFormatMode = col.TextFormatMode;
                                    })

                                if (item.ColumnName === "GRBASEDIV" || item.ColumnName === "UNLI") {
                                    item.DataType  = "BOOLEAN";
                                }
                            })
                        }
                        
                        me._aColumns[sTabId.replace("Tab", "")] = oData.results;
                        me.setTableColumns(oData.results);

                        var oDDTextResult = me.getView().getModel("ddtext").getData();
                        oData.results.forEach(item => {
                            oDDTextResult[item.ColumnName] = item.ColumnLabel;
                        })

                        me.getView().setModel(new JSONModel(oDDTextResult), "ddtext");
                    }
                },
                error: function (err) {
                }
            });
        },

        setTableColumns(arg) {
            var me = this;
            var oColumns = arg;
            var oTable = this.getView().byId("detailTab");
            oTable.setModel(new JSONModel({columns: oColumns}));
            // oTable.getModel("detail").setProperty("/columns", oColumns);

            //bind the dynamic column to the table
            oTable.bindColumns("/columns", function (index, context) {
                var sColumnId = context.getObject().ColumnName;
                var sColumnLabel = context.getObject().ColumnLabel;
                var sColumnType = context.getObject().ColumnType;
                var sColumnWidth = context.getObject().ColumnWidth;
                var sColumnVisible = context.getObject().Visible;
                var sColumnSorted = context.getObject().Sorted;
                var sColumnSortOrder = context.getObject().SortOrder;
                var sColumnDataType = context.getObject().DataType;
                var sTextWrapping = context.getObject().WrapText;

                if (sColumnWidth === 0) sColumnWidth = 100;

                var oText = new sap.m.Text({
                    wrapping: sTextWrapping === "X" ? true : false,
                    tooltip: sColumnDataType === "BOOLEAN" ? "" : "{" + sColumnId + "}"
                })

                if (sColumnId === "BASEUOM") {
                    oText.bindText({  
                        parts: [  
                            { path: "detail>" + sColumnId }
                        ],  
                        formatter: function(sColumnId) {
                            var oValue = me.getView().getModel("uom").getData().filter(v => v.MSEHI === sColumnId);

                            if (oValue && oValue.length > 0) {
                                return oValue[0].MSEHL + " (" + sColumnId + ")";
                            }
                            else return sColumnId;
                        }
                    });

                    return new sap.ui.table.Column({
                        id: "inforecCol" + sColumnId,
                        name: sColumnId,
                        label: new sap.m.Text({text: sColumnLabel}), 
                        template: oText,
                        width: sColumnWidth + 'px',
                        sortProperty: sColumnId,
                        autoResizable: true,
                        visible: sColumnVisible,
                        sorted: sColumnSorted,                        
                        hAlign: sColumnDataType === "NUMBER" ? "End" : sColumnDataType === "BOOLEAN" ? "Center" : "Begin",
                        sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending" ),
                    }); 
                }
                else {
                    return new sap.ui.table.Column({
                        // id: sColumnId,
                        name: sColumnId,
                        label: new sap.m.Text({text: sColumnLabel}), 
                        template: me.columnTemplate(sColumnId, sColumnDataType, sTextWrapping),
                        width: sColumnWidth + 'px',
                        sortProperty: sColumnId,
                        // filterProperty: sColumnId,
                        autoResizable: true,
                        visible: sColumnVisible,
                        sorted: sColumnSorted,                        
                        hAlign: sColumnDataType === "NUMBER" ? "End" : sColumnDataType === "BOOLEAN" ? "Center" : "Begin",
                        sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending")
                    });
                }
            });

            var vWrap = oColumns[0].WrapText === "X" ? true : false;
            this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataWrap/detailTab", vWrap);
            this.getView().getModel("ui").setProperty("/dataWrap/detailTab", vWrap);

            //date/number sorting
            oTable.attachSort(function(oEvent) {
                var sPath = oEvent.getParameter("column").getSortProperty();
                var bMultiSort = oEvent.getParameter("columnAdded");
                var bDescending, sSortOrder, oSorter, oColumn, columnType;
                var aSorts = [];

                if (!bMultiSort) {
                    oTable.getColumns().forEach(col => {
                        if (col.getSorted()) {
                            col.setSorted(false);
                        }
                    })
                }

                oTable.getSortedColumns().forEach(col => {
                    if (col.getProperty("name") === sPath) {
                        sSortOrder = oEvent.getParameter("sortOrder");
                        oEvent.getParameter("column").setSorted(true); //sort icon indicator
                        oEvent.getParameter("column").setSortOrder(sSortOrder); //set sort order                          
                    }
                    else {
                        sSortOrder = col.getProperty("sortOrder");
                    }

                    bDescending = (sSortOrder === "Descending" ? true : false);
                    oSorter = new sap.ui.model.Sorter(col.getProperty("name"), bDescending); //sorter(columnData, If Ascending(false) or Descending(True))
                    oColumn = oColumns.filter(fItem => fItem.ColumnName === col.getProperty("name"));
                    columnType = oColumn[0].DataType;

                    if (columnType === "DATETIME") {
                        oSorter.fnCompare = function(a, b) {
                            // parse to Date object
                            var aDate = new Date(a);
                            var bDate = new Date(b);

                            if (bDate === null) { return -1; }
                            if (aDate === null) { return 1; }
                            if (aDate < bDate) { return -1; }
                            if (aDate > bDate) { return 1; }

                            return 0;
                        };
                    }
                    else if (columnType === "NUMBER") {
                        oSorter.fnCompare = function(a, b) {
                            // parse to Date object
                            var aNumber = +a;
                            var bNumber = +b;

                            if (bNumber === null) { return -1; }
                            if (aNumber === null) { return 1; }
                            if (aNumber < bNumber) { return -1; }
                            if (aNumber > bNumber) { return 1; }

                            return 0;
                        };
                    }

                    aSorts.push(oSorter);
                })

                oTable.getBinding('rows').sort(aSorts);

                // prevent internal sorting by table
                oEvent.preventDefault();
            });

            TableFilter.updateColumnMenu("detailTab", this);
            this.setRowEditMode("detail");
        },

        getDiscRate() {
            var oHeaderData = this.getOwnerComponent().getModel("CREATEPO_MODEL").getData().header;
            var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
            var oParam = {};
            var iCounter = 0;
            var mData = {};
            var me = this;

            oHeaderData.forEach(item => {               
                setTimeout(() => {
                    oParam["N_GetDiscRateParam"] = [{
                        ConditionType: "RL01",
                        PurchasingOrg: item.PURCHORG,
                        Vendor: item.VENDOR,
                        CustomerGroup: item.CUSTGRP,
                        Forwhatdate: sapDateFormat.format(new Date())
                    }]
        
                    oParam["N_GetDiscRateReturn"] = [];

                    oModel.create("/GetDiscRateSet", oParam, {
                        method: "POST",
                        success: function(oData, oResponse) {
                            iCounter++;
                            mData[item.GROUP] = oData["N_GetDiscRateReturn"].results;
    
                            if (iCounter === oHeaderData.length) {
                                me.getView().setModel(new JSONModel(mData), "discrates");
                            } 
                        },
                        error: function (err) {
                            iCounter++;
                        }
                    });
                }, 100);
            })

        },

        onEditHdr: function(oEvent) {
            this.setRowEditMode("header");

            this.byId("btnEditHdr").setVisible(false);
            this.byId("btnUpdDate").setVisible(false);
            this.byId("btnFabSpecs").setVisible(false);
            this.byId("btnHdrTxt").setVisible(false);
            this.byId("btnGenPO").setVisible(false);
            this.byId("btnSaveHdr").setVisible(true);
            this.byId("btnCancelHdr").setVisible(true);

            this._aHeaderDataBeforeChange = jQuery.extend(true, [], this.getView().getModel("header").getData());
        },

        onCancelHdr: function(oEvent) {
            if (this._bHeaderChanged) {
                var oData = {
                    Process: "header-cancel",
                    Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                }

                // var oJSONModel = new JSONModel();
                // oJSONModel.setData(oData);

                if (!this._ConfirmDialog) {
                    this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);

                    this._ConfirmDialog.setModel(new JSONModel(oData));
                    this.getView().addDependent(this._ConfirmDialog);
                }
                else this._ConfirmDialog.setModel(new JSONModel(oData));
                    
                this._ConfirmDialog.open();
            }
            else {
                this.setRowReadMode("header");

                this.byId("btnEditHdr").setVisible(true);
                this.byId("btnUpdDate").setVisible(true);
                this.byId("btnFabSpecs").setVisible(true);
                this.byId("btnHdrTxt").setVisible(true);
                this.byId("btnGenPO").setVisible(true);
                this.byId("btnSaveHdr").setVisible(false);
                this.byId("btnCancelHdr").setVisible(false);
                
                // var oJSONModel = new JSONModel();
                // oJSONModel.setData(this._aHeaderDataBeforeChange);
    
                this.byId("headerTab").setModel(new JSONModel(this._aHeaderDataBeforeChange), "header");
                this.byId("headerTab").bindRows({path: "header>/"});                
            }
        },

        onEditDtl: function(oEvent) {
            this.setRowEditMode("detail");

            this.byId("btnEditDtl").setVisible(false);
            // this.byId("btnRefreshDtl").setVisible(false);
            this.byId("btnSaveDtl").setVisible(true);
            this.byId("btnCancelDtl").setVisible(true);
            this._aDetailsDataBeforeChange = jQuery.extend(true, [], this.getView().getModel("detail").getData());
        },

        onCancelDtl: function(oEvent) {
            if (this._bDetailsChanged) {
                var oData = {
                    Process: "details-cancel",
                    Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                }

                // var oJSONModel = new JSONModel();
                // oJSONModel.setData(oData);

                if (!this._ConfirmDialog) {
                    this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);

                    this._ConfirmDialog.setModel(new JSONModel(oData));
                    this.getView().addDependent(this._ConfirmDialog);
                }
                else this._ConfirmDialog.setModel(new JSONModel(oData));
                    
                this._ConfirmDialog.open();
            }
            else {
                this.setRowReadMode("detail");

                this.byId("btnEditDtl").setVisible(true);
                this.byId("btnRefreshDtl").setVisible(true);
                this.byId("btnSaveDtl").setVisible(false);
                this.byId("btnCancelDtl").setVisible(false);

                // var oJSONModel = new JSONModel();
                // oJSONModel.setData(this._aDetailsDataBeforeChange);
    
                this.byId("detailTab").setModel(new JSONModel(this._aDetailsDataBeforeChange), "detail");
                this.byId("detailTab").bindRows({path: "detail>/"});
            }
        },

        onSaveHdr: function(oEvent) {
            var bProceed = true;

            if (this._validationErrors.length === 0) {
                this.getView().getModel("header").getData().forEach(item => {
                    if (item.PAYTERMS === "" || item.INCOTERMS === "" || item.DESTINATION === "" || item.SHIPMODE === "") {
                        bProceed = false;
                    }
                })

                if (bProceed) {
                    this.setRowReadMode("header");

                    this.byId("btnEditHdr").setVisible(true);
                    this.byId("btnUpdDate").setVisible(true);
                    this.byId("btnFabSpecs").setVisible(true);
                    this.byId("btnHdrTxt").setVisible(true);
                    this.byId("btnGenPO").setVisible(true);
                    this.byId("btnSaveHdr").setVisible(false);
                    this.byId("btnCancelHdr").setVisible(false);
                    this._bHeaderChanged = false;
                }
                else {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_INPUT_REQD_FIELDS"]);
                }
            }
            else  {
                var msg = this.getView().getModel("ddtext").getData()["INFO_CHECK_INVALID_ENTRIES"];
                MessageBox.information(msg);
            }
        },

        onSaveDtl: function(oEvent) {
            var bProceed = true;

            if (this._validationErrors.length === 0) {
                this.getView().getModel("detail").getData().forEach(item => {
                    if (item.DELVDATE === "" || item.BASEPOQTY === "") {
                        bProceed = false;
                    }
                })

                if (bProceed) {
                    this.setRowReadMode("detail");

                    this.byId("btnEditDtl").setVisible(true);
                    this.byId("btnRefreshDtl").setVisible(true);
                    this.byId("btnSaveDtl").setVisible(false);
                    this.byId("btnCancelDtl").setVisible(false);
                    this._bDetailsChanged = false;
                }
                else {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_INPUT_REQD_FIELDS"]);
                }
            }
            else  {
                var msg = this.getView().getModel("ddtext").getData()["INFO_CHECK_INVALID_ENTRIES"];
                MessageBox.information(msg);
            }
        },

        setRowReadMode(arg) {
            var oTable = this.byId(arg + "Tab");

            oTable.getColumns().forEach((col, idx) => {
                var sColName = "";

                if (col.mAggregations.template.mBindingInfos.text !== undefined) {
                    sColName = col.mAggregations.template.mBindingInfos.text.parts[0].path;
                }
                else if (col.mAggregations.template.mBindingInfos.selected !== undefined) {
                    sColName = col.mAggregations.template.mBindingInfos.selected.parts[0].path;
                }
                else if (col.mAggregations.template.mBindingInfos.value !== undefined) {
                    sColName = col.mAggregations.template.mBindingInfos.value.parts[0].path;
                }

                this._aColumns[arg].filter(item => item.name === sColName)
                    .forEach(ci => {
                        col.setTemplate(new sap.m.Text({text: "{" + arg + ">" + ci.ColumnName + "}"}));

                        if (ci.required) {
                            col.getLabel().removeStyleClass("requiredField");
                        }
                    })
            })

            this._bHeaderChanged = false;
            this._bDetailsChanged = false;
        },

        setRowEditMode(arg) {
            var me = this;
            var oTable = this.byId(arg + "Tab");

            this._bHeaderChanged = false;
            this._bDetailsChanged = false;
            this._validationErrors = [];

            var oInputEventDelegate = {
                onkeydown: function(oEvent){
                    me.onInputKeyDown(oEvent);
                },
            };

            oTable.getColumns().forEach((col, idx) => {
                var sColName = "";

                if (col.mAggregations.template.mBindingInfos.text !== undefined) {
                    sColName = col.mAggregations.template.mBindingInfos.text.parts[0].path;
                }
                else if (col.mAggregations.template.mBindingInfos.selected !== undefined) {
                    sColName = col.mAggregations.template.mBindingInfos.selected.parts[0].path;
                }
                else if (col.mAggregations.template.mBindingInfos.value !== undefined) {
                    sColName = col.mAggregations.template.mBindingInfos.value.parts[0].path;
                }

                this._aColumns[arg].filter(item => item.ColumnName === sColName)
                    .forEach(ci => {
                        if (ci.Editable) {
                            if (ci.ValueHelp && ci.ValueHelp["show"]) {
                                var bValueFormatter = true;
                                // var sSuggestItemText = ci.ValueHelp["SuggestionItems"].text;
                                // var sSuggestItemAddtlText = ci.ValueHelp["SuggestionItems"].additionalText !== undefined ? ci.ValueHelp["SuggestionItems"].additionalText : '';                                    
                                var sTextFormatMode = "Key";
    
                                if (ci.TextFormatMode && ci.TextFormatMode !== "" && ci.TextFormatMode !== "Key" && ci.ValueHelp["items"].value !== ci.ValueHelp["items"].text) {
                                    sTextFormatMode = ci.TextFormatMode;
                                }
                                
                                var oColumns = [], oCells = [];
                                            
                                //assign first cell to key/code
                                this._oModelColumns[ci.ValueHelp["columns"]].filter(fItem => fItem.Key === true).forEach(item => {
                                    oColumns.push(new sap.m.Column({
                                        header: new sap.m.Label({ text: this.getView().getModel("ddtext").getData()[item.ColumnName] })
                                    }))
    
                                    oCells.push(new sap.m.Text({
                                        text: { path: ci.ValueHelp["items"].path + ">" + item.ColumnName }
                                    }))
                                })
    
                                //assign second cell to display value/description
                                this._oModelColumns[ci.ValueHelp["columns"]].filter(fItem => fItem.Key === false && fItem.Value === true).forEach(item => {
                                    oColumns.push(new sap.m.Column({
                                        header: new sap.m.Label({ text: this.getView().getModel("ddtext").getData()[item.ColumnName] })
                                    }))
    
                                    oCells.push(new sap.m.Text({
                                        text: { path: ci.ValueHelp["items"].path + ">" + item.ColumnName }
                                    }))
                                })
    
                                //add other column info
                                this._oModelColumns[ci.ValueHelp["columns"]].filter(fItem => fItem.Visible === true && fItem.Key === false && fItem.Value === false).forEach(item => {
                                    oColumns.push(new sap.m.Column({
                                        header: new sap.m.Label({ text: this.getView().getModel("ddtext").getData()[item.ColumnName] }),
                                    }))
    
                                    oCells.push(new sap.m.Text({
                                        text: { path: ci.ValueHelp["items"].path + ">" + item.ColumnName }
                                    }))
                                })
    
                                var oInput = new sap.m.Input({
                                    type: "Text",
                                    showValueHelp: true,
                                    valueHelpRequest: TableValueHelp.handleTableValueHelp.bind(this),
                                    showSuggestion: true,
                                    maxSuggestionWidth: ci.ValueHelp["SuggestionItems"].maxSuggestionWidth !== undefined ? ci.ValueHelp["SuggestionItems"].maxSuggestionWidth : "1px",
                                    suggestionColumns: oColumns,
                                    suggestionRows: {
                                        path: ci.ValueHelp["SuggestionItems"].path,
                                        template: new sap.m.ColumnListItem({
                                            cells: oCells
                                        }),
                                        length: 10000,
                                        templateShareable: false
                                    },
                                    change: this.onValueHelpInputChange.bind(this),
                                    suggest: this.onInputSuggest.bind(this),
                                    suggestionItemSelected: this.onInputSuggestionItemSelected.bind(this)
                                })
    
                                oInput.setSuggestionRowValidator(this.suggestionRowValidator);
    
                                if (bValueFormatter) {
                                    oInput.setProperty("textFormatMode", sTextFormatMode)
    
                                    oInput.bindValue({  
                                        parts: [{ path: arg + ">" + sColName }, { value: ci.ValueHelp["items"].path }, { value: ci.ValueHelp["items"].value }, { value: ci.ValueHelp["items"].text }, { value: sTextFormatMode }],
                                        formatter: this.formatValueHelp.bind(this)
                                    });
                                }
                                else {
                                    oInput.bindValue({  
                                        parts: [  
                                            { path: arg + ">" + sColName }
                                        ]
                                    });
                                }
    
                                oInput.addEventDelegate(oInputEventDelegate);
    
                                col.setTemplate(oInput);
                            }
                            else if (ci.DataType === "NUMBER") {
                                col.setTemplate(new sap.m.Input({
                                    type: sap.m.InputType.Number,
                                    textAlign: sap.ui.core.TextAlign.Right,
                                    // value: "{" + arg + ">" + sColName + "}",
                                    value: "{path:'" + arg + ">" + sColName + "', formatOptions:{ minFractionDigits:" + ci.Decimal + ", maxFractionDigits:" + ci.Decimal + " }, constraints:{ precision:" + ci.Length + ", scale:" + ci.Decimal + " }}",
                                    // change: this.onNumberChange.bind(this),
                                    liveChange: this.onNumberLiveChange.bind(this), 
                                    enabled: true
                                }).addEventDelegate(oInputEventDelegate));
                            }
                            else if (ci.DataType === "DATE" || ci.DataType === "DATETIME") {
                                col.setTemplate(new sap.m.DatePicker({
                                    value: "{" + arg + ">" + sColName + "}",
                                    displayFormat: "MM/dd/yyyy",
                                    valueFormat: "MM/dd/yyyy",
                                    change: this.onDateChange.bind(this),
                                    navigate: this.onClickDate.bind(this)
                                }).addEventDelegate(oInputEventDelegate))
                            }
                            else {
                                col.setTemplate(new sap.m.Input({
                                    value: "{" + arg + ">" + ci.ColumnName + "}"
                                    // liveChange: this.onInputLiveChange.bind(this)
                                }).addEventDelegate(oInputEventDelegate));
                            }
                        }

                        if (ci.Mandatory) {
                            col.getLabel().addStyleClass("sapMLabelRequired");
                        }
                    }) 

                    // if (sColName === "GROSSPRICE") col.getLabel().addStyleClass("sapMLabelRequired");                    
            })

            this.getView().getModel(arg).getData().forEach(item => item.Edited = false);

            setTimeout(() => {
                var iGPCellIndex = -1, iOTCellIndex = -1, iUTCellIndex = -1, iUnliCellIndex = -1, iOrdUOMCellIndex = -1, iOrdPrxUnitCellIndex = -1, iSupTypCellIndex = -1;
                oTable.getRows()[0].getCells().forEach((cell, idx) => {
                    if (cell.getBindingInfo("value") !== undefined) {
                        if (cell.getBindingInfo("value").parts[0].path === "GROSSPRICE") iGPCellIndex = idx;
                        else if (cell.getBindingInfo("value").parts[0].path === "OVERDELTOL") iOTCellIndex = idx;
                        else if (cell.getBindingInfo("value").parts[0].path === "UNDERDELTOL") iUTCellIndex = idx;
                        else if (cell.getBindingInfo("value").parts[0].path === "ORDUOM") iOrdUOMCellIndex = idx;
                        else if (cell.getBindingInfo("value").parts[0].path === "ORDERPRICEUNIT") iOrdPrxUnitCellIndex = idx;
                        else if (cell.getBindingInfo("value").parts[0].path === "SUPPLYTYPE") iSupTypCellIndex = idx;
                    }
                    else if (cell.getBindingInfo("selected") !== undefined) {
                        if (cell.getBindingInfo("selected").parts[0].path === "UNLI") iUnliCellIndex = idx;
                    }
                })

                this._iGPCellIndex = iGPCellIndex;
                // console.log(iGPCellIndex)
                var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;

                this.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup).forEach((item, index) => {
                    if (item.INFORECCHECK) { oTable.getRows()[index].getCells()[iGPCellIndex].setProperty("enabled", false); }
                    else { oTable.getRows()[index].getCells()[iGPCellIndex].setProperty("enabled", true); }

                    if (item.CHECK && item.MRPSUPTYP !== "NOM") {
                        oTable.getRows()[index].getCells()[iOrdUOMCellIndex].setProperty("enabled", true);
                        oTable.getRows()[index].getCells()[iOrdPrxUnitCellIndex].setProperty("enabled", true);
                        oTable.getRows()[index].getCells()[iSupTypCellIndex].setProperty("enabled", true);
                    }
                    else {
                        oTable.getRows()[index].getCells()[iOrdUOMCellIndex].setProperty("enabled", false);
                        oTable.getRows()[index].getCells()[iOrdPrxUnitCellIndex].setProperty("enabled", false);
                        oTable.getRows()[index].getCells()[iSupTypCellIndex].setProperty("enabled", false);
                    }
                    
                    if (!item.WITHPOTOL && (item.CHECK && item.MRPSUPTYP !== "NOM")) {
                        oTable.getRows()[index].getCells()[iOTCellIndex].setProperty("enabled", true);
                        oTable.getRows()[index].getCells()[iUTCellIndex].setProperty("enabled", true);
                        oTable.getRows()[index].getCells()[iUnliCellIndex].setProperty("editable", true);
                    }
                    else {
                        oTable.getRows()[index].getCells()[iOTCellIndex].setProperty("enabled", false);
                        oTable.getRows()[index].getCells()[iUTCellIndex].setProperty("enabled", false);
                        oTable.getRows()[index].getCells()[iUnliCellIndex].setProperty("editable", false);
                    }
                })
            }, 100);

            this.closeLoadingDialog();
        },

        setValuePrecision(oEvent) {
            var me = this;
            var oSource = oEvent.srcControl.oParent;
            var sModel = oSource.getBindingInfo("value").parts[0].model;
            var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
            var vDecPlaces = 0;

            if (oSource.getBindingInfo("value").parts[0].path === "BASEPOQTY") {
                vDecPlaces = me.getView().getModel(sModel).getProperty(sRowPath + "/ANDEC");
            }

            oSource.setDisplayValuePrecision(+vDecPlaces);
        },

        setFormInputValueHelp: function(oEvent) {
            var me = this;
            var oInterval = setInterval(() => {
                if (me.getView().getModel("payterms") !== undefined) {
                    var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
                    var vhPayTerm = me.getView().getModel("payterms").getData()[sActiveGroup];

                    me.getView().setModel(new JSONModel(vhPayTerm), "payterm");
                    clearInterval(oInterval);
                }
            }, 1000);

            // this.byId("headerForm").getFormContainers().forEach(c => {
            //     c.getFormElements().forEach(e => {
            //         e.getFields().forEach(f => {
            //             if (f.getBindingInfo("value") !== undefined) {
            //                 var sColName = f.getBindingInfo("value").parts[0].path.replace("/0/", "");

            //                 this._aColumns[arg].filter(item => item.name === sColName)
            //                 .forEach(ci => {
            //                     if (ci.valueHelp["show"]) {
            //                         col.setTemplate(new sap.m.Input({
            //                             type: "Text",
            //                             value: "{" + arg + ">" + sColName + "}",
            //                             showValueHelp: true,
            //                             valueHelpRequest: this.handleValueHelp.bind(this),
            //                             showSuggestion: true,
            //                             maxSuggestionWidth: ci.valueHelp["suggestionItems"].additionalText !== undefined ? ci.valueHelp["suggestionItems"].maxSuggestionWidth : "1px",
            //                             suggestionItems: {
            //                                 path: sColName === "SHIPMODE" ? ci.valueHelp["suggestionItems"].path : '',
            //                                 length: 10000,
            //                                 template: new sap.ui.core.ListItem({
            //                                     key: ci.valueHelp["suggestionItems"].text, 
            //                                     text: ci.valueHelp["suggestionItems"].text,
            //                                     additionalText: ci.valueHelp["suggestionItems"].additionalText !== undefined ? ci.valueHelp["suggestionItems"].additionalText : '',
            //                                 }),
            //                                 templateShareable: false
            //                             },
            //                             suggest: this.handleSuggestion.bind(this),
            //                             change: this.onValueHelpInputChange.bind(this)
            //                         }));
            //                     }
            //                     else if (ci.type === "NUMBER") {
            //                         col.setTemplate(new sap.m.Input({
            //                             type: sap.m.InputType.Number,
            //                             textAlign: sap.ui.core.TextAlign.Right,
            //                             // value: "{" + arg + ">" + sColName + "}",
            //                             value: "{path:'" + arg + ">" + sColName + "', formatOptions:{ minFractionDigits:" + ci.scale + ", maxFractionDigits:" + ci.scale + " }, constraints:{ precision:" + ci.precision + ", scale:" + ci.scale + " }}",
            //                             change: this.onNumberChange.bind(this)
            //                         }));
            //                     }
            //                     else if (ci.type === "DATE") {
            //                         col.setTemplate(new sap.m.DatePicker({
            //                             value: "{" + arg + ">" + sColName + "}",
            //                             displayFormat: "MM/dd/yyyy",
            //                             valueFormat: "MM/dd/yyyy",
            //                             change: this.onDateChange.bind(this)
            //                         }))
            //                     }
            //                     else {
            //                         col.setTemplate(new sap.m.Input({
            //                             value: "{" + arg + ">" + ci.name + "}"
            //                             // liveChange: this.onInputLiveChange.bind(this)
            //                         }));
            //                     }
        
            //                     if (ci.required) {
            //                         col.getLabel().addStyleClass("requiredField");
            //                     }
            //                 })                            
            //             }
            //         })
            //     })
            // })
        },

        handleSuggestion: function(oEvent) {
            var me = this;
            var oInput = oEvent.getSource();
            var sModel = oInput.getBindingInfo("value").parts[0].model;
            var sInputField = oInput.getBindingInfo("value").parts[0].path;
            var oInputCtx = oEvent.getSource().getBindingContext(sModel);
            var sRowPath = oInputCtx.getPath();
            var sGroup = oInputCtx.getModel().getProperty(sRowPath + '/GROUP');

            if (sInputField === "PAYTERMS" || sInputField === "INCOTERMS" || sInputField === "DESTINATION") {
                if (oInput.getSuggestionItems().length === 0) { 
                    var oData = me.getView().getModel("payterms").getData()[sGroup];
                    var sKey = "";

                    if (sInputField === "PAYTERMS") { 
                        sKey = "ZTERM";
                    }
                    else if (sInputField === "INCOTERMS") { 
                        sKey = "INCO1";
                    }
                    else if (sInputField === "DESTINATION") {
                        sKey = "INCO2";
                    }
                    
                    oInput.bindAggregation("suggestionItems", {
                        path: "payterms>/" + sGroup,
                        length: 10000,
                        template: new sap.ui.core.ListItem({
                            key: "{payterms>" + sKey + "}",
                            text: "{payterms>" + sKey + "}"
                        }),
                        templateShareable: false
                    });
                }
            }
        },

        setReqColHdrColor(arg) {
            var oTable = this.byId(arg + "Tab");

            oTable.getColumns().forEach((col, idx) => {
                var sColName = col.mAggregations.template.mBindingInfos.text.parts[0].path;

                this._aColumns[arg].filter(item => item.name === sColName)
                    .forEach(ci => {
                        if (ci.required) {
                            col.getLabel().removeStyleClass("requiredField");
                        }
                    })
            })
        },
        
        handleValueHelp: function(oEvent) {
            var oModel = this.getOwnerComponent().getModel();
            var oSource = oEvent.getSource();
            var sModel = oSource.getBindingInfo("value").parts[0].model;
            var me = this;

            this._inputId = oSource.getId();
            this._inputValue = oSource.getValue();
            this._inputSource = oSource;

            if (sModel === "grpheader") sModel = "header";

            if (sModel === "header") {
                this._inputField = oSource.getBindingInfo("value").parts[0].path.replace("/0/", "");
            }
            else {
                this._inputField = oSource.getBindingInfo("value").parts[0].path;
            }

            if (this._inputField === 'SHIPMODE' || this._inputField === 'INCOTERMS' || this._inputField === 'SUPPLYTYPE' || this._inputField === 'ORDUOM' || this._inputField === 'ORDERPRICEUNIT') {
                var vCellPath = this._inputField;
                var vColProp = this._aColumns[sModel].filter(item => item.name === vCellPath);
                var vItemValue = vColProp[0].valueHelp.items.value;
                var vItemDesc = vColProp[0].valueHelp.items.text;
                var sPath = vColProp[0].valueHelp.items.path;
                var vh = this.getView().getModel(sPath).getData();
                var sTextFormatMode = vColProp[0].TextFormatMode === undefined || vColProp[0].TextFormatMode === "" ? "Key" : vColProp[0].TextFormatMode;
                
                vh.forEach(item => {
                    item.VHTitle = item[vItemValue];
                    item.VHDesc = vItemValue === vItemDesc ? "" : item[vItemDesc];

                    if (sTextFormatMode === "Key") {
                        item.VHSelected = this._inputValue === item[vItemValue];
                    }
                    else if (sTextFormatMode === "Value") {
                        item.VHSelected = this._inputValue === item[vItemDesc];
                    }
                    else if (sTextFormatMode === "KeyValue") {
                        item.VHSelected = this._inputValue === (item[vItemValue] + " (" + item[vItemDesc] + ")");
                    }
                    else if (sTextFormatMode === "ValueKey") {
                        item.VHSelected = this._inputValue === (item[vItemDesc] + " (" + item[vItemValue] + ")");
                    }

                    if (item.VHSelected) { this._inputKey = item[vItemValue]; }
                })

                // vh.forEach(item => {
                //     item.VHTitle = item[vItemValue];
                //     item.VHDesc = item[vItemDesc];
                //     item.VHSelected = (item[vItemValue] === me._inputValue);
                // })

                vh.sort((a,b) => (a.VHTitle > b.VHTitle ? 1 : -1));

                var oVHModel = new JSONModel({
                    items: vh,
                    title: vColProp[0].label,
                    table: sModel
                });  
                
                // create value help dialog
                if (!me._valueHelpDialog) {
                    me._valueHelpDialog = sap.ui.xmlfragment(
                        "zuiaprocess.view.fragments.valuehelp.ValueHelpDialog",
                        me
                    );
                    
                    me._valueHelpDialog.setModel(oVHModel);
                    me.getView().addDependent(me._valueHelpDialog);
                }
                else {
                    me._valueHelpDialog.setModel(oVHModel);
                }                            

                me._valueHelpDialog.open();
            }
            // else if (this._inputField === 'INCOTERMS') {
            //     me._oModel.read("/IncoTermsSet", {
            //         success: function (oData, oResponse) {
            //             me.getView().setModel(new JSONModel(oData.results), "incoterm");
            //         },
            //         error: function (err) { }
            //     });                
            // }
            else {
                var sVendor = "", sPurchOrg = "";

                if (sModel === "header") {
                    sVendor = this.getView().getModel("grpheader").getData()[0].VENDOR;
                    sPurchOrg = this.getView().getModel("grpheader").getData()[0].PURCHORG;
                }
                else {
                    this._inputSourceCtx = oEvent.getSource().getBindingContext(sModel);
                    sVendor = this._inputSourceCtx.getModel().getProperty(this._inputSourceCtx.getPath() + '/VENDOR');
                    sPurchOrg = this._inputSourceCtx.getModel().getProperty(this._inputSourceCtx.getPath() + '/PURCHORG');    
                }                
                
                if (!isNaN(sVendor)) {
                    while (sVendor.length < 10) sVendor = "0" + sVendor;
                }

                oModel.read("/PayTermsSet", {
                    urlParameters: {
                        "$filter": "LIFNR eq '" + sVendor + "' and EKORG eq '" + sPurchOrg + "'"
                    },
                    success: function (oData, oResponse) {                        
                        var sTitle = "";

                        oData.results.forEach(item => {
                            if (me._inputField === "PAYTERMS") {
                                item.VHTitle = item.ZTERM;
                                // item.VHDesc = item.ZTERM;
                                item.VHSelected = (item.ZTERM === me._inputValue);
                            }
                            else if (me._inputField === "INCOTERMS") {
                                item.VHTitle = item.INCO1;
                                // item.VHDesc = item.INCO1;
                                item.VHSelected = (item.INCO1 === me._inputValue);    
                            }
                            else if (me._inputField === "DESTINATION") {
                                item.VHTitle = item.INCO2;
                                // item.VHDesc = item.INCO2;
                                item.VHSelected = (item.INCO2 === me._inputValue);    
                            }
                        });

                        oData.results.sort((a,b) => (a.VHTitle > b.VHTitle ? 1 : -1));

                        switch (me._inputField) {
                            case "PAYTERMS": 
                                sTitle = "Payment Terms";
                                break;
                            case "INCOTERMS": 
                                sTitle = "Inco Terms";
                                break;
                            case "DESTINATION": 
                                sTitle = "Destination";
                                break;                                
                        }

                        var oVHModel = new JSONModel({
                            items: oData.results,
                            title: sTitle,
                            table: sModel
                        }); 

                        // create value help dialog
                        if (!me._valueHelpDialog) {
                            me._valueHelpDialog = sap.ui.xmlfragment(
                                "zuiaprocess.view.fragments.valuehelp.ValueHelpDialog",
                                me
                            );
                            
                            me._valueHelpDialog.setModel(oVHModel);
                            me.getView().addDependent(me._valueHelpDialog);
                        }
                        else {
                            me._valueHelpDialog.setModel(oVHModel);
                        }                            

                        me._valueHelpDialog.open();
                    },
                    error: function (err) { }
                });                
            }
            // else {
            //     var vCellPath = this._inputField;
            //     var vColProp = this._aColumns[sModel].filter(item => item.name === vCellPath);
            //     var vItemValue = vColProp[0].valueHelp.items.value;
            //     var vItemDesc = vColProp[0].valueHelp.items.text;
            //     var sEntity = vColProp[0].valueHelp.items.path;
                
            //     oModel.read(sEntity, {
            //         success: function (data, response) {
            //             data.results.forEach(item => {
            //                 item.VHTitle = item[vItemValue];
            //                 item.VHDesc = item[vItemDesc];
            //                 item.VHSelected = (item[vItemValue] === _this._inputValue);
            //             });
                        
            //             var oVHModel = new JSONModel({
            //                 items: data.results,
            //                 title: vColProp[0].label,
            //                 table: sModel
            //             });                            

            //             // create value help dialog
            //             if (!_this._valueHelpDialog) {
            //                 _this._valueHelpDialog = sap.ui.xmlfragment(
            //                     "zuigmc2.view.ValueHelpDialog",
            //                     _this
            //                 );
                            
            //                 // _this._valueHelpDialog.setModel(
            //                 //     new JSONModel({
            //                 //         items: data.results,
            //                 //         title: vColProp[0].label,
            //                 //         table: sModel
            //                 //     })
            //                 // )

            //                 _this._valueHelpDialog.setModel(oVHModel);
            //                 _this.getView().addDependent(_this._valueHelpDialog);
            //             }
            //             else {
            //                 _this._valueHelpDialog.setModel(oVHModel);
            //                 // _this._valueHelpDialog.setModel(
            //                 //     new JSONModel({
            //                 //         items: data.results,
            //                 //         title: vColProp[0].label,
            //                 //         table: sModel
            //                 //     })
            //                 // )
            //             }                            

            //             _this._valueHelpDialog.open();
            //         },
            //         error: function (err) { }
            //     })
            // }
        },

        handleValueHelpClose : function (oEvent) {
            if (oEvent.sId === "confirm") {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                // var sTable = this._valueHelpDialog.getModel().getData().table;

                if (oSelectedItem) {
                    // this._inputSource.setValue(oSelectedItem.getTitle());
                    this._inputSource.setSelectedKey(oSelectedItem.getTitle());
                    // var sRowPath = this._inputSource.getBindingInfo("value").binding.oContext.sPath;

                    if (this._inputValue !== oSelectedItem.getTitle()) {                                
                        // this.getView().getModel("mainTab").setProperty(sRowPath + '/Edited', true);
                        this._bHeaderChanged = true;
                    }
                }

                this._inputSource.setValueState("None");
            }
            else if (oEvent.sId === "cancel") {

            }
        },

        onValueHelpInputChange: function(oEvent) {
            if (this._validationErrors === undefined) this._validationErrors = [];

            var oSource = oEvent.getSource();
            var isInvalid = !oSource.getSelectedKey() && oSource.getValue().trim();
            oSource.setValueState(isInvalid ? "Error" : "None");

            // var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
            var sRowPath = "";
            var sModel = oSource.getBindingInfo("value").parts[0].model;
            var vValue = oSource.getSelectedKey();

            // oSource.getSuggestionItems().forEach(item => {
            //     if (item.getProperty("key") === oSource.getValue().trim()) {
            //         isInvalid = false;
            //         oSource.setValueState(isInvalid ? "Error" : "None");
            //     }
            // })

            if (isInvalid) {
                this.validateInputValue(oSource);
            }
            else {
                this.setValuesAfterInputChange(oSource);
                // this._validationErrors.forEach((item, index) => {
                //     if (item === oEvent.getSource().getId()) {
                //         this._validationErrors.splice(index, 1)
                //     }
                // })
            }

            // if (sModel === "detail") { 
            //     var oTable = this.byId(sModel + "Tab");
            //     sRowPath = oSource.oParent.getBindingContext(sModel).sPath
                
            //     if (oSource.getBindingInfo("value").parts[0].path === "SUPPLYTYPE") {
            //         var oSupplyType = this.getView().getModel("supplyType").getData().filter(fItem => fItem.SUPPLYTYP === oSource.getSelectedKey());
            //         var iRowIndex = +sRowPath.split("/")[sRowPath.split("/").length-1];
    
            //         if (oSupplyType[0].FOC === "X") {
            //             //disable gross/net price, set value to zero                    
            //             oTable.getRows()[iRowIndex].getCells()[this._iGPCellIndex].setProperty("enabled", false);
    
            //             this.getView().getModel(sModel).setProperty(sRowPath + '/GROSSPRICE', "0");
            //             oTable.getModel(sModel).setProperty(sRowPath + '/GROSSPRICE', "0");
            //         }
            //         else {
            //             var vInfoRecCheck = this.getView().getModel(sModel).getProperty(sRowPath + '/INFORECCHECK');
            //             if (vInfoRecCheck) { oTable.getRows()[iRowIndex].getCells()[this._iGPCellIndex].setProperty("enabled", false); }
            //             else { oTable.getRows()[iRowIndex].getCells()[this._iGPCellIndex].setProperty("enabled", true); }
            //         }
            //     }
            //     else if (oSource.getBindingInfo("value").parts[0].path === "ORDUOM") {
            //         var oUOM = this.getView().getModel("uom").getData().filter(fItem => fItem.MSEHI === oSource.getSelectedKey());
            //         var vOrderUOMANDEC = this.getView().getModel(sModel).getProperty(sRowPath + '/ORDERUOMANDEC');
    
            //         if (vOrderUOMANDEC !== oUOM[0].ANDEC) {
            //             var vBasePOQty = this.getView().getModel(sModel).getProperty(sRowPath + '/BASEPOQTY');
            //             var vBaseConvFactor = this.getView().getModel(sModel).getProperty(sRowPath + '/BASECONVFACTOR');
            //             var vOrderConvFactor = this.getView().getModel(sModel).getProperty(sRowPath + '/ORDERCONVFACTOR');
            //             var vPer = this.getView().getModel(sModel).getProperty(sRowPath + '/PER');
    
            //             var sOrderConvFactor = vOrderConvFactor === "" || vOrderConvFactor === "0" ? "1" : vOrderConvFactor;
            //             var sBaseConvFactor = vBaseConvFactor === "" || vBaseConvFactor === "0" ? "1" : vBaseConvFactor;
            //             var sPer = vPer === "" ? "1" : vPer;
            //             var vComputedPOQty = +vBasePOQty / ((+sOrderConvFactor) * (+sBaseConvFactor) * (+sPer));
            //             var vFinalPOQty = "0";
    
            //             if (oUOM[0].ANDEC === 0) vFinalPOQty = Math.ceil(vComputedPOQty).toString();
            //             else vFinalPOQty = vComputedPOQty.toFixed(oUOM[0].ANDEC);
    
            //             this.getView().getModel(sModel).setProperty(sRowPath + '/ORDERUOMANDEC', oUOM[0].ANDEC);
            //             this.getView().getModel(sModel).setProperty(sRowPath + '/ORDERPOQTY', vFinalPOQty);
            //         }
            //     }

            //     this.getView().getModel(sModel).setProperty(sRowPath + '/' + oSource.getBindingInfo("value").parts[0].path, vValue);

            //     if (oSource.getSelectedKey() === "") { oSource.setSelectedKey(vValue); }
            // }

            this._bHeaderChanged = true;
        },

        // onStepInputChange: function(oEvent) {
        //     var me = this;
        //     var oSource = oEvent.getSource();
        //     var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
        //     var sModel = oSource.getBindingInfo("value").parts[0].model;
        //     var vDecPlaces = 0;

        //     if (oSource.getBindingInfo("value").parts[0].path === "BASEPOQTY") {
        //         vDecPlaces = me.getView().getModel(sModel).getProperty(sRowPath + "/ANDEC");
        //     }

        //     if (vDecPlaces === 0) {
        //         oSource.setValue((+oSource.getValue()).toFixed(0));
        //     }

        //     if (oSource.getBindingInfo("value").parts[0].path === "BASEPOQTY") {
        //         var sActiveGroup = me.getView().getModel("ui").getData().activeGroup;

        //         me.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)
        //             .forEach((item, idx) => {
        //                 if (idx.toString() === sRowPath.replace("/","")) { 
        //                     var sOrderConvFactor = item.ORDERCONVFACTOR === "" || item.ORDERCONVFACTOR === "0" ? "1" : item.ORDERCONVFACTOR;
        //                     var sBaseConvFactor = item.BASECONVFACTOR === "" || item.BASECONVFACTOR === "0" ? "1" : item.BASECONVFACTOR;
        //                     var sPer = item.PER === "" ? "1" : item.PER;
        //                     var vComputedPOQty = +item.BASEPOQTY / ((+sOrderConvFactor) * (+sBaseConvFactor) * (+sPer));
        //                     var vFinalPOQty = "0";

        //                     if (item.ORDERUOMANDEC === 0) vFinalPOQty = Math.ceil(vComputedPOQty).toString();
        //                     else vFinalPOQty = vComputedPOQty.toFixed(item.ORDERUOMANDEC);

        //                     item.ORDERPOQTY = vFinalPOQty;
        //                     me.getPOTolerance(sRowPath, item);
        //                 }
        //         })
    
        //         me.byId("detailTab").setModel(new JSONModel(me.getView().getModel("detail").getData()), "detail");
        //         me.byId("detailTab").bindRows({path: "detail>/"});
        //     }
        // },

        // onNumberChange: function(oEvent) {
        //     if (this._validationErrors === undefined) this._validationErrors = [];

        //     var oSource = oEvent.getSource();
        //     var sModel = oSource.getBindingInfo("value").parts[0].model;
        //     var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
        //     var vDecPlaces = 0;

        //     if (oSource.getBindingInfo("value").parts[0].path === "BASEPOQTY") {
        //         vDecPlaces = this.getView().getModel(sModel).getProperty(sRowPath + "/ANDEC");
        //     }
        //     else if (oSource.getBindingInfo("value").parts[0].path === "BASEPOQTY2") {
        //         vDecPlaces = 3;
        //     }

        //     if (oEvent.getParameters().value.split(".").length > 1) {
        //         if (vDecPlaces === 0) {
        //             // MessageBox.information("Value should not have decimal place/s.");
        //             oEvent.getSource().setValueState("Error");
        //             oEvent.getSource().setValueStateText("Value should not have decimal place/s.");
        //             this._validationErrors.push(oEvent.getSource().getId());
        //         }
        //         else {
        //             if (oEvent.getParameters().value.split(".")[1].length > vDecPlaces) {
        //                 oEvent.getSource().setValueState("Error");
        //                 oEvent.getSource().setValueStateText("Enter a number with a maximum decimal places: " + vDecPlaces.toString());
        //                 this._validationErrors.push(oEvent.getSource().getId());
        //             }
        //             else {
        //                 oEvent.getSource().setValueState("None");
        //                 this._validationErrors.forEach((item, index) => {
        //                     if (item === oEvent.getSource().getId()) {
        //                         this._validationErrors.splice(index, 1)
        //                     }
        //                 })
        //             }
        //         }
        //     }
        //     else {
        //         oEvent.getSource().setValueState("None");
        //         this._validationErrors.forEach((item, index) => {
        //             if (item === oEvent.getSource().getId()) {
        //                 this._validationErrors.splice(index, 1)
        //             }
        //         })
        //     }
           
        //     // var oSource = oEvent.getSource();
        //     // var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
        //     // var sModel = oSource.getBindingInfo("value").parts[0].model;
        //     // this.getView().getModel(sModel).setProperty(sRowPath + '/Edited', true);
        //     this._bDetailsChanged = false;

        //     if (oEvent.getSource().getBindingInfo("value").parts[0].path === "BASEPOQTY") {
        //         var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
        //         // var sRowPath = oEvent.getSource().getBindingInfo("value").binding.oContext.sPath

        //         this.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)
        //             .forEach((item, idx) => {
        //                 if (idx.toString() === sRowPath.replace("/","")) { 
        //                     var sOrderConvFactor = item.ORDERCONVFACTOR === "" || item.ORDERCONVFACTOR === "0" ? "1" : item.ORDERCONVFACTOR;
        //                     var sBaseConvFactor = item.BASECONVFACTOR === "" || item.BASECONVFACTOR === "0" ? "1" : item.BASECONVFACTOR;
        //                     var sPer = item.PER === "" ? "1" : item.PER;
        //                     var vComputedPOQty = +item.BASEPOQTY / ((+sOrderConvFactor) * (+sBaseConvFactor) * (+sPer));
        //                     var vFinalPOQty = "0";

        //                     if (item.ORDERUOMANDEC === 0) vFinalPOQty = Math.ceil(vComputedPOQty).toString();
        //                     else vFinalPOQty = vComputedPOQty.toFixed(item.ORDERUOMANDEC);

        //                     item.ORDERPOQTY = vFinalPOQty;
        //                     this.getPOTolerance(sRowPath, item);
        //                 }
        //         })
    
        //         // var oJSONModel = new JSONModel();
        //         // oJSONModel.setData(this.getView().getModel("detail").getData());
    
        //         this.byId("detailTab").setModel(new JSONModel(this.getView().getModel("detail").getData()), "detail");
        //         this.byId("detailTab").bindRows({path: "detail>/"});
        //     }
        //     else if (oEvent.getSource().getBindingInfo("value").parts[0].path === "GROSSPRICE") {
        //         var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
        //         var sRowPath = oEvent.getSource().getBindingInfo("value").binding.oContext.sPath

        //         this.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)
        //             .forEach((item, idx) => {
        //                 if (idx.toString() === sRowPath.replace("/","")) { 
        //                     item.NETPRICE = item.GROSSPRICE
        //                 }
        //         })
    
        //         this.byId("detailTab").setModel(new JSONModel(this.getView().getModel("detail").getData()), "detail");
        //         this.byId("detailTab").bindRows({path: "detail>/"});
        //     }
        // },

        onNumberLiveChange: function(oEvent) {
            if (this._validationErrors === undefined) this._validationErrors = [];

            var oSource = oEvent.getSource();
            var sModel = oSource.getBindingInfo("value").parts[0].model;
            var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
            var vDecPlaces = 0;
            var bError = false;

            if (oSource.getBindingInfo("value").parts[0].path === "BASEPOQTY") {
                vDecPlaces = this.getView().getModel(sModel).getProperty(sRowPath + "/ANDEC");
            }
            else if (oSource.getBindingInfo("value").parts[0].path === "GROSSPRICE")  {
                vDecPlaces = 4;
            }
            else if (oSource.getBindingInfo("value").parts[0].path === "OVERDELTOL" || oSource.getBindingInfo("value").parts[0].path === "UNDERDELTOL")  {
                vDecPlaces = 1;
            }

            if (oEvent.getParameters().value.split(".").length > 1) {
                if (vDecPlaces === 0) {
                    // MessageBox.information("Value should not have decimal place/s.");
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Value should not have decimal place/s.");
                    this._validationErrors.push(oEvent.getSource().getId());
                    bError = true;
                }
                else {
                    if (oEvent.getParameters().value.split(".")[1].length > vDecPlaces) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText("Enter a number with a maximum decimal places: " + vDecPlaces.toString());
                        this._validationErrors.push(oEvent.getSource().getId());
                        bError = true;
                    }
                    else {
                        oEvent.getSource().setValueState("None");
                        this._validationErrors.forEach((item, index) => {
                            if (item === oEvent.getSource().getId()) {
                                this._validationErrors.splice(index, 1)
                            }
                        })
                        bError = false;
                    }
                }
            }
            else {
                oEvent.getSource().setValueState("None");
                this._validationErrors.forEach((item, index) => {
                    if (item === oEvent.getSource().getId()) {
                        this._validationErrors.splice(index, 1)
                    }
                })
                bError = false;
            }
           
            // this._bDetailsChanged = false;
            if (!bError) {
                if (oEvent.getSource().getBindingInfo("value").parts[0].path === "BASEPOQTY") {
                    var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
    
                    this.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)
                        .forEach((item, idx) => {
                            if (idx.toString() === sRowPath.replace("/","")) { 
                                item.BASEPOQTY = oEvent.getParameters().value;
    
                                var sOrderConvFactor = item.ORDERCONVFACTOR === "" || item.ORDERCONVFACTOR === "0" ? "1" : item.ORDERCONVFACTOR;
                                var sBaseConvFactor = item.BASECONVFACTOR === "" || item.BASECONVFACTOR === "0" ? "1" : item.BASECONVFACTOR;
                                var sPer = item.PER === "" ? "1" : item.PER;
                                var vComputedPOQty = +item.BASEPOQTY / ((+sOrderConvFactor) * (+sBaseConvFactor) * (+sPer));
                                var vFinalPOQty = "0";
    
                                if (item.ORDERUOMANDEC === 0) vFinalPOQty = Math.ceil(vComputedPOQty).toString();
                                else vFinalPOQty = vComputedPOQty.toFixed(item.ORDERUOMANDEC);
    
                                item.ORDERPOQTY = vFinalPOQty;
                                this.byId("detailTab").getModel("detail").setProperty(sRowPath + '/ORDERPOQTY', vFinalPOQty);
                                this.getPOTolerance(sRowPath, item);
                            }
                    })
        
                    // this.byId("detailTab").setModel(new JSONModel(this.getView().getModel("detail").getData()), "detail");
                    // this.byId("detailTab").bindRows({path: "detail>/"});
                }
                else if (oEvent.getSource().getBindingInfo("value").parts[0].path === "GROSSPRICE") {
                    var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
                    var sRowPath = oEvent.getSource().getBindingInfo("value").binding.oContext.sPath
    
                    this.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)
                        .forEach((item, idx) => {
                            if (idx.toString() === sRowPath.replace("/","")) { 
                                item.GROSSPRICE = oEvent.getParameters().value;
                                item.NETPRICE = item.GROSSPRICE;
                                this.byId("detailTab").getModel("detail").setProperty(sRowPath + '/NETPRICE', item.GROSSPRICE);
                            }
                    })
                }
            }
        },

        onInputLiveChange: function(oEvent) {
            var oSource = oEvent.getSource();
            
            if (oSource.getProperty("required") !== undefined && oSource.getProperty("required") === true) {
                if (oEvent.getParameters().value !== "") {
                    oSource.setValueState("None");
                }
            }
        },

        onDateChange: function(oEvent) {
            this.showLoadingDialog('Processing...');

            if (this._validationErrors === undefined) this._validationErrors = [];
            
            var oSource = oEvent.getSource();
            var aHeaderData = this.getView().getModel("grpheader").getData();
            var vDelvDate = oEvent.getParameters().value;
            var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
            var oParam = {};
            var me = this;            

            oParam["PurchPlant"] = aHeaderData[0].PURCHPLANT;
            oParam["N_GetFtyCalDateParam"] = [{
                CorrectOption: "+",
                Date: sapDateFormat.format(new Date(vDelvDate)),
                FactoryCalendarId: ""
            }]

            oParam["N_GetFtyCalDateReturn"] = [];
            
            oModel.create("/GetFtyCalDateSet", oParam, {
                method: "POST",
                success: function(oData, oResponse) {
                    me.closeLoadingDialog();
                    var vRetDate = sapDateFormat.format(new Date(oData["N_GetFtyCalDateReturn"].results[0].Date));
                    var vParamDate = sapDateFormat.format(new Date(oData["N_GetFtyCalDateParam"].results[0].Date));
                    var vPrevDateVal = me._prevDelvDate;

                    if (vRetDate !== vParamDate) {
                        var oData = {
                            Process: "delvdate-update",
                            Text: me.getView().getModel("ddtext").getData()["INFO_NEXT_DELVDATE"] + " " + oData["N_GetFtyCalDateReturn"].results[0].Date + ", " + me.getView().getModel("ddtext").getData()["CONTINUE"] + "?",
                            NewDelvDate: vRetDate,
                            DelvDate: vPrevDateVal,
                            Source: oSource
                        }
            
                        // var oJSONModel = new JSONModel();
                        // oJSONModel.setData(oData);
            
                        if (!me._ConfirmDialog) {
                            me._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", me);
            
                            me._ConfirmDialog.setModel(new JSONModel(oData));
                            me.getView().addDependent(me._ConfirmDialog);
                        }
                        else me._ConfirmDialog.setModel(new JSONModel(oData));
                            
                        me._ConfirmDialog.open();                        
                    }
                },
                error: function (err) { }
            });

            this._bDetailsChanged = false;
        },

        onClickDate: function(oEvent) {
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
            this._prevDelvDate = this.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)[0].DELVDATE;
        },

        onUpdDate: function(oEvent) {
            var me = this;
            var bProceed = true;

            if (this.getView().getModel("ui").getData().activeGroup === "") {
                this.getView().getModel("ui").setProperty("/activeGroup", this.getView().getModel("header").getData()[0].GROUP);
            }

            // var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;

            if (bProceed) {
                if (!this._oChangeDateDialog) {
                    this._oChangeDateDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ChangeDateDialog", this);
                    this.getView().addDependent(this._oChangeDateDialog);

                    var oDialogEventDelegate = {
                        onkeydown: function (oEvent) {
                            me.onKeyDown(oEvent);
                        }
                    };
    
                    this._oChangeDateDialog.addEventDelegate(oDialogEventDelegate);
                }
                
                this._oChangeDateDialog.setTitle(this.getView().getModel("ddtext").getData()["CHANGEDELVDATE"]);
                this._oChangeDateDialog.open(); 
                this._changeDateDialog = true;
            }           
        },

        onChangeDate: function(oEvent) {
            var aHeaderData = this.getView().getModel("grpheader").getData();
            var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
            var oParam = {};
            var me = this;
            var oDatePicker;
            var oDatePickerValue = "";

            if (oEvent === undefined) {
                oDatePicker = sap.ui.getCore().byId("DP1");
            }
            else {
                oDatePicker = oEvent.getSource().oParent.getContent().filter(fItem => fItem.sId === "DP1")[0];
            }

            oDatePickerValue = oDatePicker.getProperty("value");

            if (oDatePickerValue === "") {
                MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_INPUT_DELVDATE"]);
                return;
            }

            oParam["PurchPlant"] = aHeaderData[0].PURCHPLANT;
            oParam["N_GetFtyCalDateParam"] = [{
                CorrectOption: "+",
                Date: sapDateFormat.format(new Date(oDatePickerValue)),
                FactoryCalendarId: ""
            }]

            oParam["N_GetFtyCalDateReturn"] = [];

            oModel.create("/GetFtyCalDateSet", oParam, {
                method: "POST",
                success: function(oData, oResponse) {
                    var vParamDate = sapDateFormat.format(new Date(oDatePickerValue));
                    var vRetDate = sapDateFormat.format(new Date(oData["N_GetFtyCalDateReturn"].results[0].Date))

                    if (vRetDate !== vParamDate) {
                        var oData = {
                            Process: "batchdelvdate-update",
                            Text: me.getView().getModel("ddtext").getData()["INFO_NEXT_DELVDATE"] + " " + oData["N_GetFtyCalDateReturn"].results[0].Date + ", " + me.getView().getModel("ddtext").getData()["CONTINUE"] + "?",
                            DelvDate: oData["N_GetFtyCalDateReturn"].results[0].Date
                        }
            
                        // var oJSONModel = new JSONModel();
                        // oJSONModel.setData(oData);
            
                        if (!me._ConfirmDialog) {
                            me._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", me);
            
                            me._ConfirmDialog.setModel(new JSONModel(oData));
                            me.getView().addDependent(me._ConfirmDialog);
                        }
                        else me._ConfirmDialog.setModel(new JSONModel(oData));
                            
                        me._ConfirmDialog.open();                        
                    }
                    else {
                        me.batchUpdateDelvDate(oDatePickerValue);
                    }
                },
                error: function (err) { }
            });
        },

        updateDelvDate(arg1, arg2) {
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
            var oSource = arg1;
            var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;

            this.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)
                .forEach((item, idx) => {
                    if (idx.toString() === sRowPath.replace("/","")) item.DELVDATE = arg2;
            })

            // var oJSONModel = new JSONModel();
            // oJSONModel.setData(this.getView().getModel("detail").getData());

            this.byId("detailTab").setModel(new JSONModel(this.getView().getModel("detail").getData()), "detail");
            this.byId("detailTab").bindRows({path: "detail>/"});
        },

        batchUpdateDelvDate(arg) {
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;

            this.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup).forEach(item => {
                item.DELVDATE = arg;
            })

            // var oJSONModel = new JSONModel();
            // oJSONModel.setData(this.getView().getModel("detail").getData());

            this.byId("detailTab").setModel(new JSONModel(this.getView().getModel("detail").getData()), "detail");
            this.byId("detailTab").bindRows({path: "detail>/"});
            this._oChangeDateDialog.close();
            MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_DELVDATE_UPDATED"]);
        },

        onCloseChangeDate: function(oEvent) {
            this._oChangeDateDialog.close();
            this._changeDateDialog = false;
        },
        
        onCellClick: function(oEvent) {
            var vGroup = "";
            
            if (oEvent.getParameters().rowBindingContext !== undefined) {
                vGroup = oEvent.getParameters().rowBindingContext.getObject().GROUP;
            }

            this.getView().getModel("ui").setProperty("/activeGroup", vGroup);

            var oDataDetail = this.getOwnerComponent().getModel("CREATEPO_MODEL").getData().detail.filter(fItem => fItem.GROUP === vGroup);
            // var oJSONModel = new JSONModel();
            // oJSONModel.setData(oDataDetail);

            this.getView().setModel(new JSONModel(oDataDetail), "detail");
            
            this.byId("detailTab").setModel(new JSONModel(oDataDetail), "detail");
            this.byId("detailTab").bindRows({path: "detail>/"});
        },

        onFabSpecs: function(oEvent) {
            this._bFabSpecsChanged = false;

            if (this.getView().getModel("ui").getData().activeGroup === "") {
                this.getView().getModel("ui").setProperty("/activeGroup", this.getView().getModel("header").getData()[0].GROUP);
            }

            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
            
            if (!this._FabSpecsDialog) {
                this._FabSpecsDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.FabSpecsDialog", this);    
                
                this._FabSpecsDialog.setModel(
                    new JSONModel({
                        items: this.getView().getModel("fabspecs").getData()[sActiveGroup]
                    }, "fs")
                )

                this.getView().addDependent(this._FabSpecsDialog);
            }
            else {
                // this._FabSpecsDialog.getModel().setProperty("/items", this.getView().getModel("fabspecs").getData()[sActiveGroup]);
                this._FabSpecsDialog.setModel(
                    new JSONModel({
                        items: this.getView().getModel("fabspecs").getData()[sActiveGroup]
                    }, "fs")
                )
            }

            this._aFabSpecsDataBeforeChange = jQuery.extend(true, [], this.getView().getModel("fabspecs").getData()[sActiveGroup]);
            
            // this._FabSpecsDialog.setTitle(this.getView().getModel("ddtext").getData()["FABSPECS"] + " - " + this.getView().getModel("ddtext").getData()["GROUP"] + " " + sActiveGroup);
            this._FabSpecsDialog.setTitle(this.getView().getModel("ddtext").getData()["FABSPECS"]);
            this._FabSpecsDialog.open();         
        },

        onSaveFabSpecs: function(oEvent) {
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
            this.getView().getModel("fabspecs").getData()[sActiveGroup].forEach(item => {
                item.STATUS = "UPDATED";
                // item.ZZMAKT = sap.ui.getCore().byId("ZZMAKT").getValue();
                item.ZZHAFE = sap.ui.getCore().byId("ZZHAFE").getValue();
                item.ZZSHNK = sap.ui.getCore().byId("ZZSHNK").getValue();
                item.ZZCHNG = sap.ui.getCore().byId("ZZCHNG").getValue();
                item.ZZSTAN = sap.ui.getCore().byId("ZZSTAN").getValue();
                item.ZZDRY = sap.ui.getCore().byId("ZZDRY").getValue();
                item.ZZCFWA = sap.ui.getCore().byId("ZZCFWA").getValue();
                item.ZZCFCW = sap.ui.getCore().byId("ZZCFCW").getValue();
                item.ZZSHRQ = sap.ui.getCore().byId("ZZSHRQ").getValue();
                item.ZZSHDA = sap.ui.getCore().byId("ZZSHDA").getValue();
                item.PLANMONTH = sap.ui.getCore().byId("PLANMONTH1").getText();
                item.ZZREQ1 = sap.ui.getCore().byId("ZZREQ1").getValue();
                item.ZZREQ2 = sap.ui.getCore().byId("ZZREQ2").getValue();
                // item.EBELP = sap.ui.getCore().byId("EBELP").getValue();
                // item.EBELN = sap.ui.getCore().byId("EBELN").getValue();
            });

            MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_FABSPECS_SAVED"])

            this._bFabSpecsChanged = false;
        },

        onDeleteFabSpecs: function(oEvent) {
            var oData = {
                Process: "fabspecs-delete",
                Text: "Confirm delete fab specs?"
            }

            // var oJSONModel = new JSONModel();
            // oJSONModel.setData(oData);

            if (!this._ConfirmDialog) {
                this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);

                this._ConfirmDialog.setModel(new JSONModel(oData));
                this.getView().addDependent(this._ConfirmDialog);
            }
            else this._ConfirmDialog.setModel(new JSONModel(oData));
                
            this._ConfirmDialog.open(); 
        },

        clearFabSpecs() {
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
            var oData = this.getView().getModel("fabspecs").getData()[sActiveGroup];

            Object.keys(oData[0]).forEach(key => {
                oData[0][key] = "";
            })

            oData[0].STATUS = "DELETED";           
            
            this._FabSpecsDialog.close();

            var oForm = sap.ui.getCore().byId("FabSpecsForm");
            oForm.getFormContainers()[0].getFormElements()[0].getFields()[0].setValue(" ");
            oForm.getFormContainers()[0].getFormElements()[0].getFields()[0].setValue("");
        },

        onCloseFabSpecs: function(oEvent) {
            if (this._bFabSpecsChanged) {
                var oData = {
                    Process: "fabspecs-close",
                    Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                }

                // var oJSONModel = new JSONModel();
                // oJSONModel.setData(oData);

                if (!this._ConfirmDialog) {
                    this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);

                    this._ConfirmDialog.setModel(new JSONModel(oData));
                    this.getView().addDependent(this._ConfirmDialog);
                }
                else this._ConfirmDialog.setModel(new JSONModel(oData));
                    
                this._ConfirmDialog.open();
            }
            else {
                this._headerTextDialog = false;
                this._oHeaderTextDialog.close();
            }
        },

        beforeOpenFabSpecs: function(oEvent) {
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;

            oEvent.getSource().setInitialFocus(sap.ui.getCore().byId("ZZMAKT"));
            var oData = this.getView().getModel("fabspecs").getData()[sActiveGroup];

            sap.ui.getCore().byId("ZZMAKT").setValue(oData[0].ZZMAKT);
            sap.ui.getCore().byId("ZZHAFE").setValue(oData[0].ZZHAFE);
            sap.ui.getCore().byId("ZZSHNK").setValue(oData[0].ZZSHNK);
            sap.ui.getCore().byId("ZZCHNG").setValue(oData[0].ZZCHNG);
            sap.ui.getCore().byId("ZZSTAN").setValue(oData[0].ZZSTAN);
            sap.ui.getCore().byId("ZZDRY").setValue(oData[0].ZZDRY);
            sap.ui.getCore().byId("ZZCFWA").setValue(oData[0].ZZCFWA);
            sap.ui.getCore().byId("ZZCFCW").setValue(oData[0].ZZCFCW);
            sap.ui.getCore().byId("ZZSHRQ").setValue(oData[0].ZZSHRQ);
            sap.ui.getCore().byId("ZZSHDA").setValue(oData[0].ZZSHDA);
            sap.ui.getCore().byId("PLANMONTH1").setText(oData[0].PLANMONTH);
            sap.ui.getCore().byId("ZZREQ1").setValue(oData[0].ZZREQ1);
            sap.ui.getCore().byId("ZZREQ2").setValue(oData[0].ZZREQ2);
            // sap.ui.getCore().byId("EBELP").setValue(oData[0].EBELP);
            // sap.ui.getCore().byId("EBELN").setValue(oData[0].EBELN);
        },

        onFabSpecsChange: function(oEvent) {
            this._bFabSpecsChanged = true;
        },

        onHdrText: function(oEvent) {
            var me = this;
            this._bRemarksChanged = false;
            this._bPackInsChanged = false;

            if (this.getView().getModel("ui").getData().activeGroup === "") {
                this.getView().getModel("ui").setProperty("/activeGroup", this.getView().getModel("header").getData()[0].GROUP);
            }

            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;

            // //GET UNIQ OBJ, just for double checking
            // var mapRemarks = new Map(this.getView().getModel("remarks").getData()[sActiveGroup].map(pos => [pos.ITEM, pos]).reverse());
            // var uniqRemarks = [...mapRemarks.values()].reverse();
            // this.getView().getModel("remarks").setProperty('/' + sActiveGroup, uniqRemarks);

            // var mapPackIns = new Map(this.getView().getModel("packins").getData()[sActiveGroup].map(pos => [pos.ITEM, pos]).reverse());
            // var uniqPackIns = [...mapPackIns.values()].reverse();
            // this.getView().getModel("packins").setProperty('/' + sActiveGroup, uniqPackIns);

            if (!this._oHeaderTextDialog) {
                this._oHeaderTextDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.HeaderTextDialog", this);

                this._oHeaderTextDialog.setModel(
                    new JSONModel({
                        rem_items: this.getView().getModel("remarks").getData()[sActiveGroup],
                        packins_items: this.getView().getModel("packins").getData()[sActiveGroup],
                        fs: this.getView().getModel("fabspecs").getData()[sActiveGroup]
                    })
                )

                this.getView().addDependent(this._oHeaderTextDialog);

                // var oTableEventDelegate = {
                //     onkeydown: function (oEvent) {
                //         me.onKeyDown(oEvent);
                //     },
    
                //     onclick: function(oEvent) {
                //         me.onTableClick(oEvent);
                //     }
                // };
    
                // sap.ui.getCore().byId("remarksTab").addEventDelegate(oTableEventDelegate);
                // sap.ui.getCore().byId("packinsTab").addEventDelegate(oTableEventDelegate);

                var oDialogEventDelegate = {
                    onkeydown: function (oEvent) {
                        me.onKeyDown(oEvent);
                    }
                };

                this._oHeaderTextDialog.addEventDelegate(oDialogEventDelegate);
            }
            else {
                this._oHeaderTextDialog.getModel().setProperty("/rem_items", this.getView().getModel("remarks").getData()[sActiveGroup]);
                this._oHeaderTextDialog.getModel().setProperty("/packins_items", this.getView().getModel("packins").getData()[sActiveGroup]);
                this._oHeaderTextDialog.getModel().setProperty("/fs", this.getView().getModel("fabspecs").getData()[sActiveGroup]);
            }

            this._aRemarksDataBeforeChange = jQuery.extend(true, [], this.getView().getModel("remarks").getData()[sActiveGroup]);
            this._aPackInsDataBeforeChange = jQuery.extend(true, [], this.getView().getModel("packins").getData()[sActiveGroup]);
            this._aFabSpecsDataBeforeChange = jQuery.extend(true, [], this.getView().getModel("fabspecs").getData()[sActiveGroup]);

            this._oHeaderTextDialog.setTitle(this.getView().getModel("ddtext").getData()["HEADERTEXT"]);
            this._oHeaderTextDialog.open(); 

            var oHeaderData = this.getView().getModel("grpheader").getData();
            var oHdrTxtTab = sap.ui.getCore().byId("ITB1");
            oHdrTxtTab.setSelectedKey("remarks");

            if (oHeaderData[0].DOCTYPE !== "ZFAB") {
                oHdrTxtTab.getItems().forEach(item => {
                    if (item.getProperty("key") === "fabspecs") { item.setProperty("enabled", false) }
                });
            }
            else {
                oHdrTxtTab.getItems().forEach(item => {
                    item.setProperty("enabled", true);
                });
            }

            var oData = this.getView().getModel("fabspecs").getData()[sActiveGroup];
            sap.ui.getCore().byId("ZZMAKT").setValue(oData[0].ZZMAKT);
            sap.ui.getCore().byId("ZZHAFE").setValue(oData[0].ZZHAFE);
            sap.ui.getCore().byId("ZZSHNK").setValue(oData[0].ZZSHNK);
            sap.ui.getCore().byId("ZZCHNG").setValue(oData[0].ZZCHNG);
            sap.ui.getCore().byId("ZZSTAN").setValue(oData[0].ZZSTAN);
            sap.ui.getCore().byId("ZZDRY").setValue(oData[0].ZZDRY);
            sap.ui.getCore().byId("ZZCFWA").setValue(oData[0].ZZCFWA);
            sap.ui.getCore().byId("ZZCFCW").setValue(oData[0].ZZCFCW);
            sap.ui.getCore().byId("ZZSHRQ").setValue(oData[0].ZZSHRQ);
            sap.ui.getCore().byId("ZZSHDA").setValue(oData[0].ZZSHDA);
            sap.ui.getCore().byId("PLANMONTH1").setText(oData[0].PLANMONTH);
            sap.ui.getCore().byId("ZZREQ1").setValue(oData[0].ZZREQ1);
            sap.ui.getCore().byId("ZZREQ2").setValue(oData[0].ZZREQ2);
            // sap.ui.getCore().byId("EBELP").setValue(oData[0].EBELP);
            // sap.ui.getCore().byId("EBELN").setValue(oData[0].EBELN);

            this._sActiveTable = sap.ui.getCore().byId("ITB1").getSelectedKey() + "Tab";
            this._headerTextDialog = true;

            var oInputEventDelegate = {
                onkeydown: function(oEvent){
                    me.onInputKeyDown(oEvent);
                },
            };

            sap.ui.getCore().byId("remarksTab").getColumns()[1].getTemplate().addEventDelegate(oInputEventDelegate);
            sap.ui.getCore().byId("packinsTab").getColumns()[1].getTemplate().addEventDelegate(oInputEventDelegate);
        },

        New() {
            this._sActiveTable = sap.ui.getCore().byId("ITB1").getSelectedKey() + "Tab";
            this.addHdrTxt();
        },

        onAddHdrTxt: function(oEvent) {
            this._sActiveTable = sap.ui.getCore().byId("ITB1").getSelectedKey() + "Tab";            
            this.addHdrTxt();
        },

        addHdrTxt() {
            var oTable, oData;
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
            
            sap.ui.getCore().byId("btnAddHdrTxt").focus();

            if (this._sActiveTable === "remarksTab") {
                oTable = sap.ui.getCore().byId("remarksTab");
                oData = oTable.getModel().getProperty('/rem_items');

                if (oData === undefined) {
                    var aDataRemItems = [];
    
                    aDataRemItems.push({
                        GROUP: sActiveGroup,
                        ITEM: "1",
                        REMARKS: "",
                        STATUS: ""
                    });
        
                    this.getView().getModel("remarks").setProperty("/" + sActiveGroup, aDataRemItems);
                    this._oHeaderTextDialog.getModel().setProperty("/rem_items", this.getView().getModel("remarks").getData()[sActiveGroup]);
                }
            }
            else {
                oTable = sap.ui.getCore().byId("packinsTab");
                oData = oTable.getModel().getProperty('/packins_items');    
                
                if (oData === undefined) {
                    var aDataPackInsItems = [];
    
                    aDataPackInsItems.push({
                        GROUP: sActiveGroup,
                        ITEM: "1",
                        PACKINS: "",
                        STATUS: ""
                    });
        
                    this.getView().getModel("packins").setProperty("/" + sActiveGroup, aDataPackInsItems);
                    this._oHeaderTextDialog.getModel().setProperty("/packins_items", this.getView().getModel("packins").getData()[sActiveGroup]);
                }
            }
                        
            if (oData !== undefined) {
                var length = oData.length;
                var lastSeqno = 0;
    
                if (length > 0) {
                    lastSeqno = parseInt(oData[length - 1].ITEM);
                }
    
                lastSeqno++;
    
                var seqno = lastSeqno.toString();
    
                oData.push({
                    "GROUP": sActiveGroup,
                    "ITEM": seqno,
                    "STATUS": "NEW"
                });

                oTable.getBinding("rows").refresh();
            }
        },

        onSaveHdrTxt: function(oEvent) {
            var activeTab = sap.ui.getCore().byId("ITB1").getSelectedKey();
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;
            sap.ui.getCore().byId("btnSaveHdrTxt").focus();

            if (activeTab === "remarks") {
                if (this._oHeaderTextDialog.getModel().getData().rem_items.filter(item => item.REMARKS === "").length > 0) {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_INPUT_REMARKS"]);
                }
                else {
                    this._bRemarksChanged = false;
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_REMARKS_SAVED"]);

                    this.getView().getModel("remarks").setProperty('/' + sActiveGroup, this._oHeaderTextDialog.getModel().getData().rem_items);
                    this.getView().getModel("remarks").getData()[sActiveGroup].forEach(item => item.STATUS = "UPDATED");
                    this._aRemarksDataBeforeChange = jQuery.extend(true, [], this.getView().getModel("remarks").getData()[sActiveGroup]);
                }
            }
            else if (activeTab === "packins") {
                if (this._oHeaderTextDialog.getModel().getData().packins_items.filter(item => item.PACKINS === "").length > 0) {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_INPUT_PACKINS"]);
                }
                else {
                    // this._oHeaderTextDialog.close();
                    this._bPackInsChanged = false;
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_PACKINS_SAVED"]);

                    this.getView().getModel("packins").setProperty('/' + sActiveGroup, this._oHeaderTextDialog.getModel().getData().packins_items);
                    this.getView().getModel("packins").getData()[sActiveGroup].forEach(item => item.STATUS = "UPDATED");
                    this._aPackInsDataBeforeChange = jQuery.extend(true, [], this.getView().getModel("packins").getData()[sActiveGroup]);
                }
            }
            else {
                this.onSaveFabSpecs();
            }
        },

        onDeleteHdrTxt: function(oEvent) {
            var activeTab = sap.ui.getCore().byId("ITB1").getSelectedKey();
            var oTable, sProcess;
            sap.ui.getCore().byId("btnDeleteHdrTxt").focus();

            if (activeTab === "fabspecs") {
                this.onDeleteFabSpecs();
            }
            else {
                if (activeTab === "remarks") {
                    oTable = sap.ui.getCore().byId("remarksTab");
                    sProcess = "remarks-delete";
                } 
                else if (activeTab === "packins") {
                    oTable = sap.ui.getCore().byId("packinsTab");
                    sProcess = "packins-delete";
                }

                if (oTable.getSelectedIndices().length === 0) {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_SEL_RECORD_TO_DELETE"]);
                }
                else {
                    var oData = {
                        Process: sProcess,
                        Text: this.getView().getModel("ddtext").getData()["CONF_DELETE_RECORDS"]
                    }
    
                    // var oJSONModel = new JSONModel();
                    // oJSONModel.setData(oData);
                    
                    if (!this._ConfirmDialog) {
                        this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);
    
                        this._ConfirmDialog.setModel(new JSONModel(oData));
                        this.getView().addDependent(this._ConfirmDialog);
                    }
                    else this._ConfirmDialog.setModel(new JSONModel(oData));
                        
                    this._ConfirmDialog.open(); 
                }
            }
        },

        onCloseHdrTxt: function(oEvent) {
            var activeTab = sap.ui.getCore().byId("ITB1").getSelectedKey();
            var oData;
            var bProceed = true;
            var iNew = 0;

            if (activeTab === "fabspecs") {
                this.onCloseFabSpecs();
            }
            else {
                if (activeTab === "remarks") {
                    if (this._oHeaderTextDialog.getModel().getData().rem_items !== undefined) {
                        iNew = this._oHeaderTextDialog.getModel().getData().rem_items.filter(item => item.STATUS === "NEW").length;
                    }
    
                    if (this._bRemarksChanged || iNew > 0) {
                        bProceed = false;
    
                        oData = {
                            Process: "remarks-close",
                            Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                        }
                    }
                }
                else if (activeTab === "packins") {
                    if (this._oHeaderTextDialog.getModel().getData().packins_items !== undefined) {
                        iNew = this._oHeaderTextDialog.getModel().getData().packins_items.filter(item => item.STATUS === "NEW").length;
                    }
    
                    if (this._bPackInsChanged || iNew > 0) {
                        bProceed = false;
    
                        oData = {
                            Process: "packins-close",
                            Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                        }
                    }
                }
    
                if (!bProceed) {
                    // var oJSONModel = new JSONModel();
                    // oJSONModel.setData(oData);
    
                    if (!this._ConfirmDialog) {
                        this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);
    
                        this._ConfirmDialog.setModel(new JSONModel(oData));
                        this.getView().addDependent(this._ConfirmDialog);
                    }
                    else this._ConfirmDialog.setModel(new JSONModel(oData));
                        
                    this._ConfirmDialog.open();
                }
                else {
                    this._headerTextDialog = false;
                    this._oHeaderTextDialog.close();
                }
            }
        },

        onRemarksChange: function(oEvent) {
            this._bRemarksChanged = true;
        },

        onPackInsChange: function(oEvent) {
            this._bPackInsChanged = true;
        },

        onSelectHdrTxtTab: function(oEvent) {
            var activeTab = sap.ui.getCore().byId("ITB1").getSelectedKey();
            var bProceed = true;
            var iNew = 0;

            this._sActiveTable = activeTab + "Tab";

            if (activeTab === "remarks") {
                sap.ui.getCore().byId("btnAddHdrTxt").setVisible(true);

                if (this._oHeaderTextDialog.getModel().getData().rem_items !== undefined) {
                    iNew = this._oHeaderTextDialog.getModel().getData().rem_items.filter(item => item.STATUS === "NEW").length;
                }

                if (this._bPackInsChanged) {
                    bProceed = false;

                    oData = {
                        Process: "packins-cancel",
                        Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                    }
                }
                else if (this._bFabSpecsChanged) {
                    bProceed = false;

                    oData = {
                        Process: "fabspecs-cancel",
                        Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                    }                    
                }
            }
            else if (activeTab === "packins") {
                sap.ui.getCore().byId("btnAddHdrTxt").setVisible(true);

                if (this._oHeaderTextDialog.getModel().getData().packins_items !== undefined) {
                    iNew = this._oHeaderTextDialog.getModel().getData().packins_items.filter(item => item.STATUS === "NEW").length;
                }

                if (this._bRemarksChanged) {
                    bProceed = false;

                    oData = {
                        Process: "remarks-cancel",
                        Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                    }
                }
                else if (this._bFabSpecsChanged) {
                    bProceed = false;

                    oData = {
                        Process: "fabspecs-cancel",
                        Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                    }                    
                }
            }
            else if (activeTab === "fabspecs") {
                sap.ui.getCore().byId("btnAddHdrTxt").setVisible(false);
                
                if (this._oHeaderTextDialog.getModel().getData().fs !== undefined) {
                    iNew = this._oHeaderTextDialog.getModel().getData().fs.filter(item => item.STATUS === "UPDATED").length;
                }

                if (this._bRemarksChanged) {
                    bProceed = false;

                    oData = {
                        Process: "remarks-cancel",
                        Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                    }
                }
                else if (this._bPackInsChanged) {
                    bProceed = false;

                    oData = {
                        Process: "packins-cancel",
                        Text: this.getView().getModel("ddtext").getData()["CONF_DISCARD_CHANGE"]
                    }
                }
            }

            if (!bProceed) {
                // var oJSONModel = new JSONModel();
                // oJSONModel.setData(oData);

                if (!this._ConfirmDialog) {
                    this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);

                    this._ConfirmDialog.setModel(new JSONModel(oData));
                    this.getView().addDependent(this._ConfirmDialog);
                }
                else this._ConfirmDialog.setModel(new JSONModel(oData));
                    
                this._ConfirmDialog.open();
            }
        },

        showMessage: function(oMessage, iDuration) {
            if (iDuration === undefined) iDuration = 2000;

			sap.m.MessageToast.show(oMessage, {
				duration: iDuration,
				animationDuration: 500,
                at: "center center"
			});
		},

        onCloseConfirmDialog: function(oEvent) {
            console.log(this._ConfirmDialog.getModel().getData().Process);
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup;

            if (this._ConfirmDialog.getModel().getData().Process === "remarks-close") {
                this._bRemarksChanged = false;
                this._headerTextDialog = false;
                this._oHeaderTextDialog.close();

                // var oData = this.getView().getModel("remarks").getData();
                // oData[sActiveGroup] = this._aRemarksDataBeforeChange;
                this.getView().getModel("remarks").setProperty('/' + sActiveGroup, this._aRemarksDataBeforeChange);
                this.getView().getModel("packins").setProperty('/' + sActiveGroup, this._aPackInsDataBeforeChange);
                this.getView().getModel("fabspecs").setProperty('/' + sActiveGroup, this._aFabSpecsDataBeforeChange);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "packins-close") {
                this._bPackInsChanged = false;
                this._headerTextDialog = false;
                this._oHeaderTextDialog.close();

                this.getView().getModel("packins").setProperty('/' + sActiveGroup, this._aPackInsDataBeforeChange);
                this.getView().getModel("remarks").setProperty('/' + sActiveGroup, this._aRemarksDataBeforeChange);
                this.getView().getModel("fabspecs").setProperty('/' + sActiveGroup, this._aFabSpecsDataBeforeChange);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "fabspecs-close") {
                // this.clearFabSpecs();
                this._bFabSpecsChanged = false;
                this._headerTextDialog = false;
                this._oHeaderTextDialog.close();
                
                this.getView().getModel("fabspecs").setProperty('/' + sActiveGroup, this._aFabSpecsDataBeforeChange);
                this.getView().getModel("remarks").setProperty('/' + sActiveGroup, this._aRemarksDataBeforeChange);
                this.getView().getModel("packins").setProperty('/' + sActiveGroup, this._aPackInsDataBeforeChange);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "remarks-delete") {
                var oTable = sap.ui.getCore().byId("remarksTab");
                // var oTableModel = oTable.getModel();
                var oData = this._oHeaderTextDialog.getModel().getData().rem_items; //oTableModel.getProperty('/rem_items');
                var selected = oTable.getSelectedIndices();

                oData = oData.filter(function (value, index) {
                    return selected.indexOf(index) === -1;
                })

                oTable.clearSelection();

                this._oHeaderTextDialog.getModel().setProperty("/rem_items", oData);
                this.getView().getModel("remarks").setProperty("/" + sActiveGroup,  oData);

                if (oData.length === 0) this._bRemarksChanged = false;
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "packins-delete") {
                var oTable = sap.ui.getCore().byId("packinsTab");
                // var oTableModel = oTable.getModel();
                var oData = this._oHeaderTextDialog.getModel().getData().packins_items; //oTableModel.getProperty('/packins_items');
                var selected = oTable.getSelectedIndices();
                
                oData = oData.filter(function (value, index) {
                    return selected.indexOf(index) === -1;
                })
                
                // oTableModel.setData(oData);
                oTable.clearSelection();
                // oTable.getBinding("rows").refresh();    
                
                this._oHeaderTextDialog.getModel().setProperty("/packins_items", oData);
                this.getView().getModel("packins").setProperty("/" + sActiveGroup,  oData);

                if (oData.length === 0) this._bPackInsChanged = false;
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "fabspecs-delete") {
                this.clearFabSpecs();
                this._bFabSpecsChanged = false;
                this._FabSpecsDialog.close();
                MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_DATA_DELETED"]);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "remarks-cancel") {
                this._bRemarksChanged = false;
                this.getView().getModel("remarks").setProperty('/' + sActiveGroup, this._aRemarksDataBeforeChange);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "packins-cancel") {
                this._bPackInsChanged = false;
                this.getView().getModel("packins").setProperty('/' + sActiveGroup, this._aPackInsDataBeforeChange);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "fabspecs-cancel") {
                this._bFabSpecsChanged = false;
                this.getView().getModel("fabspecs").setProperty('/' + sActiveGroup, this._aFabSpecsDataBeforeChange);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "header-cancel") {
                this.setRowReadMode("header");

                this.byId("btnEditHdr").setVisible(true);
                this.byId("btnUpdDate").setVisible(true);
                this.byId("btnFabSpecs").setVisible(true);
                this.byId("btnHdrTxt").setVisible(true);
                this.byId("btnGenPO").setVisible(true);
                this.byId("btnSaveHdr").setVisible(false);
                this.byId("btnCancelHdr").setVisible(false);
                // this.getView().getModel("detail").setProperty("/", this._aHeaderDataBeforeChange);

                // var oJSONModel = new JSONModel();
                // oJSONModel.setData(this._aHeaderDataBeforeChange);
    
                this.byId("headerTab").setModel(new JSONModel(this._aHeaderDataBeforeChange), "header");
                this.byId("headerTab").bindRows({path: "header>/"});
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "details-cancel") {
                this.setRowReadMode("detail");

                this.byId("btnEditDtl").setVisible(true);
                this.byId("btnRefreshDtl").setVisible(true);
                this.byId("btnSaveDtl").setVisible(false);
                this.byId("btnCancelDtl").setVisible(false);
                
                // var oJSONModel = new JSONModel();
                // oJSONModel.setData(this._aDetailsDataBeforeChange);
    
                this.byId("detailTab").setModel(new JSONModel(this._aDetailsDataBeforeChange), "detail");
                this.byId("detailTab").bindRows({path: "detail>/"});
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "po-cancel") {
                var oHistory, sPreviousHash;
            
                if (sap.ui.core.routing.History !== undefined) {
                    oHistory = sap.ui.core.routing.History.getInstance();
                    sPreviousHash = oHistory.getPreviousHash();
                }
    
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else { 
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteMain", {}, true /*no history*/);
                }
    
                this.setRowReadMode("detail");
                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/columnUpdate", this._columnUpdated);
                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/columns", this._aColumns);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "batchdelvdate-update") {
                this.batchUpdateDelvDate(this._ConfirmDialog.getModel().getData().DelvDate);
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "delvdate-update") {
                this.updateDelvDate(this._ConfirmDialog.getModel().getData().Source, this._ConfirmDialog.getModel().getData().NewDelvDate);
            }

            this._ConfirmDialog.close();
        },  

        onCancelConfirmDialog: function(oEvent) {
            console.log(this._ConfirmDialog.getModel().getData().Process);
            if (this._ConfirmDialog.getModel().getData().Process === "remarks-cancel") {
                sap.ui.getCore().byId("ITB1").setSelectedKey("remarks");
                sap.ui.getCore().byId("ITB1").selectedKey = "remarks";
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "packins-cancel") {
                sap.ui.getCore().byId("ITB1").setSelectedKey("packins");
                sap.ui.getCore().byId("ITB1").selectedKey = "packins";
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "fabspecs-cancel") {
                sap.ui.getCore().byId("ITB1").setSelectedKey("fabspecs");
                sap.ui.getCore().byId("ITB1").selectedKey = "fabspecs";
            }
            else if (this._ConfirmDialog.getModel().getData().Process === "delvdate-update") {
                this.updateDelvDate(this._ConfirmDialog.getModel().getData().Source, this._ConfirmDialog.getModel().getData().DelvDate);
            }

            this._ConfirmDialog.close();
        },

        checkSourceList: async (me) => {
            var oHeaderData = me.getView().getModel("grpheader").getData()[0];

            var oParam = {
                SBU: me.getOwnerComponent().getModel("UI_MODEL").getData().sbu,
                VENDOR: oHeaderData.VENDOR,
                PURCHORG: oHeaderData.PURCHORG,
                PURCHPLANT: oHeaderData.PURCHPLANT
            };

            var oParamItem = [];

            me.getView().getModel("detail").getData().forEach(item => {
                oParamItem.push({ 
                    MATTYP: item.MATERIALTYPE,
                    MATNO: item.MATERIALNO,
                    EXIST: "",
                    VALID: ""
                })
            })

            oParam["N_CheckSourceListItem"] = oParamItem;
            console.log(oParam)
            var oPromise = new Promise((resolve, reject) => {
                me._oModel.create("/CheckSourceListSet", oParam, {
                    method: "POST",
                    success: function(oResult, oResponse) {
                        console.log(oResult)
                        var oData = [];
                        
                        oResult.N_CheckSourceListItem.results.forEach(item => {
                            if (item.VALID === "X" && item.EXIST === "") {
                                oData.push({
                                    MATNO: item.MATNO,
                                    REMARKS: "No source list found."
                                })
                            }
                        })

                        if (oData.length === 0) {
                            resolve(true);
                        }
                        else {
                            resolve(false);

                            var vRowCount = oData.length > 7 ? oData : 7;

                            if (!me._CheckSourceListResultDialog) {
                                me._CheckSourceListResultDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.CheckSourceListResultDialog", me);

                                me._CheckSourceListResultDialog.setModel(
                                    new JSONModel({
                                        items: oData,
                                        ddtext: {
                                            MATNO: me.getView().getModel("ddtext").getData()["MATERIALNO"],
                                            REMARKS: me.getView().getModel("ddtext").getData()["REMARKS"],
                                        },
                                        rowCount: vRowCount
                                    })
                                )

                                me.getView().addDependent(this._CheckSourceListResultDialog);
                            }
                            else {
                                me._CheckSourceListResultDialog.getModel().setProperty("/items", oData);
                                me._CheckSourceListResultDialog.getModel().setProperty("/rowCount", vRowCount);
                            }

                            me._CheckSourceListResultDialog.setTitle("");
                            me._CheckSourceListResultDialog.open();
                        }
                    },
                    error: function(err) {
                        MessageBox.err(err.message);
                        resolve(false);
                        // Common.closeProcessingDialog(me);
                    }
                }); 
            })

            return await oPromise;
        },

        onCheckSourceListResultClose: function(oEvent) {
            this._CheckSourceListResultDialog.close();
        },

        onGeneratePO: async function(oEvent) {
            if (this._validationErrors.length === 0) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var vSBU = this.getOwnerComponent().getModel("UI_MODEL").getData().sbu;
                var bProceed = true;

                this.byId("headerForm").getFormContainers().forEach(c => {
                    c.getFormElements().forEach(e => {
                        if (e.mAggregations.label.mProperties !== undefined) {
                            if (e.mAggregations.label.mProperties.required) {
                                if (e.mAggregations.fields[0].mProperties.value === "") {
                                    bProceed = false;
                                    e.mAggregations.fields[0].setValueState("Error");
                                }
                                else {
                                    e.mAggregations.fields[0].setValueState("None");
                                }
                            }
                        }

                    })
                })
    
                if (bProceed) {
                    this.getView().getModel("detail").getData().forEach(item => {
                        if (item.DELVDATE === "" || item.BASEPOQTY == "" || item.GROSSPRICE == "") {
                            bProceed = false;
                        }
                    })
                }
                
                if (!bProceed) {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_CREATEPO_CHECK_REQD"]);
                    return;
                }

                this.showLoadingDialog('Processing...');
                bProceed = await this.checkSourceList(this);
                
                if (!bProceed) {
                    this.closeLoadingDialog();
                    return;
                }

                if (this.getView().getModel("grpheader").getData()[0].EXTEND) {
                    console.log("extend po");
                    this.extendPO();
                    bProceed = false;
                    return;
                }

                if (bProceed) {
                    console.log("generate po");
                    var iCounter = 0;
    
                    this.getView().getModel("grpheader").getData().forEach(item => {
                        setTimeout(() => {
                            this._oModel.read("/GetNoRangeCodeSet", {
                                urlParameters: {
                                    "$filter": "SBU eq '" + vSBU + "' and DOCTYP eq '" + item.DOCTYPE + "' and COMPANY eq '" +  item.COMPANY + "'"
                                },
                                success: function (oData, oResponse) {
                                    if (oData.results.length === 0) {
                                        iCounter++;

                                        me._aCreatePOResult.push({
                                            GROUP: item.GROUP,
                                            VENDOR: item.VENDOR,
                                            PURCHORG: item.PURCHORG,
                                            PURCHGRP: item.PURCHGRP,
                                            STATUS: "ERROR",
                                            REMARKS: "No number range code retrieve."
                                        })
        
                                        if (iCounter === me.getView().getModel("header").getData().length) {
                                            me.closeLoadingDialog();
                                            me.showGeneratePOResult();
                                        }
                                    }
                                    else {
                                        var oParam = {};
                            
                                        oParam["EReturnno"] = "";
                                        oParam['N_GetNumberParam'] = [{
                                            "INorangecd": oData.results[0].NORANGECD,
                                            "IKeycd": "",
                                            "IUserid": "",
                                        }];
                                        oParam['N_GetNumberReturn'] = [];
                            
                                        oModel.create("/GetNumberSet", oParam, {
                                            method: "POST",
                                            success: function(oResult, oResponse) {
                                                if (oResult.EReturnno === "") {
                                                    iCounter++;
                                                    // me.showMessage(oResult.N_GetNumberReturn[0].Type + " " + oResult.N_GetNumberReturn[0].Message);
                                                    me._aCreatePOResult.push({
                                                        GROUP: item.GROUP,
                                                        VENDOR: item.VENDOR,
                                                        PURCHORG: item.PURCHORG,
                                                        PURCHGRP: item.PURCHGRP,
                                                        STATUS: "ERROR",
                                                        REMARKS: oResult.N_GetNumberReturn.results[0].Type + " " + oResult.N_GetNumberReturn.results[0].Message
                                                    })
        
                                                    if (iCounter === me.getView().getModel("header").getData().length) {
                                                        me.closeLoadingDialog();
                                                        me.showGeneratePOResult();
                                                    }
                                                }
                                                else {
                                                    var sPONo = oResult.EReturnno;
                                                    var wInforec = false;

                                                    var oParamCPO = {};
                                                    var oParamCPOHdrData = [{
                                                        DocDate: sapDateFormat.format(new Date(item.PODATE)) + "T00:00:00",
                                                        DocType: item.DOCTYPE,
                                                        CoCode: item.COMPANY,
                                                        PurchOrg: item.PURCHORG,
                                                        PurGroup: item.PURCHGRP,
                                                        Vendor: item.VENDOR,
                                                        PoNumber: oResult.EReturnno,
                                                        CreatDate: sapDateFormat.format(new Date(item.PODATE)) + "T00:00:00",
                                                        Pmnttrms: item.PAYTERMS,
                                                        Currency: item.CURR,
                                                        ExchRate: item.EXRATE === "" ? "0" : item.EXRATE,
                                                        Incoterms1: item.INCOTERMS,
                                                        Incoterms2: item.DESTINATION,
                                                        OurRef: item.SHIPTOPLANT
                                                    }];
            
                                                    var oParamCPOHdrTextData = [];
            
                                                    me.getView().getModel("remarks").getData()[item.GROUP].filter(fItem => fItem.STATUS === "UPDATED")
                                                        .forEach(rem => {
                                                            // var sItem = rem.ITEM;
                                                            // while (sItem.length < 5) sItem = "0" + sItem;
            
                                                            oParamCPOHdrTextData.push({
                                                                PoNumber: oResult.EReturnno,
                                                                PoItem: "00000",
                                                                TextId: "F01",
                                                                TextForm: "*",
                                                                TextLine: rem.REMARKS
                                                            })
                                                        })
            
                                                    me.getView().getModel("packins").getData()[item.GROUP].filter(fItem => fItem.STATUS === "UPDATED")
                                                        .forEach(rem => {
                                                            // var sItem = rem.ITEM;
                                                            // while (sItem.length < 5) sItem = "0" + sItem;
            
                                                            oParamCPOHdrTextData.push({
                                                                PoNumber: oResult.EReturnno,
                                                                PoItem: "00000",
                                                                TextId: "F06",
                                                                TextForm: "*",
                                                                TextLine: rem.PACKINS
                                                            })
                                                        }) 
                                                        
                                                    var oParamCPOAddtlDtlsData = [];                                                                                                        
                                                    var oParamCPOItemData = [];
                                                    var oParamCPOItemSchedData = [];
                                                    var oParamCPOClosePRData = [];
                                                        
                                                    var oPODocTypeInfo = me.getView().getModel("doctype").getData().filter(fItem => fItem.Podoctyp === item.DOCTYPE);
                                                    var bGRInd = false, bIRInd = false, bGRBasedIV = false;

                                                    if (oPODocTypeInfo.length > 0) {
                                                        bGRInd = oPODocTypeInfo[0].Wepos === "X" ? true : false;
                                                        bIRInd = oPODocTypeInfo[0].Repos === "X" ? true : false;
                                                        bGRBasedIV = oPODocTypeInfo[0].Webre === "X" ? true : false;
                                                    }

                                                    var oFabSpecs = me.getView().getModel("fabspecs").getData()[item.GROUP].filter(fItem => fItem.STATUS === "UPDATED");

                                                    me.getOwnerComponent().getModel("CREATEPO_MODEL").getData().detail.filter(fItem => fItem.GROUP === item.GROUP)
                                                        .forEach(poitem => {
                                                            if (poitem.INFORECCHECK) wInforec = true;

                                                            oParamCPOItemData.push({
                                                                PoNumber: oResult.EReturnno,
                                                                PoItem: poitem.ITEM,
                                                                Material: poitem.MATERIALNO,
                                                                InfoRec: poitem.INFOREC,
                                                                MatGrp: poitem.MATERIALGRP,
                                                                ShortText: poitem.GMCDESCEN.length > 40 ? poitem.GMCDESCEN.slice(0, 40) : poitem.GMCDESCEN,
                                                                Plant: poitem.PURCHPLANT,
                                                                PoUnit: poitem.ORDUOM,
                                                                OrderprUn: poitem.ORDUOM,
                                                                NetPrice: poitem.GROSSPRICE,
                                                                PriceUnit: poitem.PER,
                                                                ConvNum1: poitem.ORDERCONVFACTOR,
                                                                ConvDen1: poitem.BASECONVFACTOR,
                                                                DispQuant: poitem.ORDERPOQTY + "",
                                                                GrInd: bGRInd,
                                                                IrInd: bIRInd,
                                                                GrBasediv: bGRBasedIV, //poitem.GRBASEDIV,
                                                                PreqNo: poitem.PRNUMBER,
                                                                PreqItem: poitem.PRITEMNO,
                                                                Shipping: item.SHIPMODE,
                                                                Over_Dlv_Tol: poitem.OVERDELTOL,
                                                                Under_Dlv_Tol: poitem.UNDERDELTOL,
                                                                Unlimited_Dlv: poitem.UNLI === true ? "X" : ""
                                                                // Zzmakt: poitem.POADDTLDESC
                                                            })
            
                                                            oParamCPOItemSchedData.push({
                                                                PoNumber: oResult.EReturnno,
                                                                PoItem: poitem.ITEM,
                                                                SchedLine: "1",
                                                                DelivDate: sapDateFormat.format(new Date(poitem.DELVDATE)) + "T00:00:00",
                                                                Quantity: poitem.ORDERPOQTY + "",
                                                                PreqNo: poitem.PRNUMBER,
                                                                PreqItem: poitem.PRITEMNO,
                                                                Batch: poitem.IONUMBER
                                                            })   
                                                            
                                                            oParamCPOClosePRData.push({
                                                                Banfn: poitem.PRNUMBER,
                                                                Bnfpo: poitem.PRITEMNO, 
                                                                Ebakz: (poitem.BASEPOQTY + poitem.ORDERQTY) >= poitem.BASEQTY ? "X" : " "
                                                            })

                                                            if (oFabSpecs.length === 0) {
                                                                oParamCPOAddtlDtlsData.push({
                                                                    PoNumber: oResult.EReturnno,
                                                                    PoItem: poitem.ITEM,
                                                                    Zzhafe: "",
                                                                    Zzshnk: "",
                                                                    Zzcfwa: "",
                                                                    Zzchng: "",
                                                                    Zzstan: "",
                                                                    Zzcfcw: "",
                                                                    Zzdry: "",
                                                                    Zzreq1: "",
                                                                    Zzreq2: "",
                                                                    Zzshrq: "",
                                                                    Zzprmo: "",
                                                                    Zzpryr: "",
                                                                    Zzmakt: poitem.POADDTLDESC
                                                                })
                                                            }
                                                            else {
                                                                if (oFabSpecs[0].ZZSHDA !== "") {
                                                                    oParamCPOAddtlDtlsData.push({
                                                                        PoNumber: oResult.EReturnno,
                                                                        PoItem: poitem.ITEM,
                                                                        Zzhafe: oFabSpecs[0].ZZHAFE,
                                                                        Zzshnk: oFabSpecs[0].ZZSHNK,
                                                                        Zzcfwa: oFabSpecs[0].ZZCFWA,
                                                                        Zzchng: oFabSpecs[0].ZZCHNG,
                                                                        Zzstan: oFabSpecs[0].ZZSTAN,
                                                                        Zzcfcw: oFabSpecs[0].ZZCFCW,
                                                                        Zzdry: oFabSpecs[0].ZZDRY,
                                                                        Zzreq1: oFabSpecs[0].ZZREQ1,
                                                                        Zzreq2: oFabSpecs[0].ZZREQ2,
                                                                        Zzshrq: oFabSpecs[0].ZZSHRQ,
                                                                        Zzshda: sapDateFormat.format(new Date(oFabSpecs[0].ZZSHDA)) + "T00:00:00",
                                                                        Zzprmo: oFabSpecs[0].PLANMONTH.slice(5,7),
                                                                        Zzpryr: oFabSpecs[0].PLANMONTH.slice(0,4),
                                                                        Zzmakt: poitem.POADDTLDESC
                                                                    })
                                                                }
                                                                else {
                                                                    oParamCPOAddtlDtlsData.push({
                                                                        PoNumber: oResult.EReturnno,
                                                                        PoItem: poitem.ITEM,
                                                                        Zzhafe: oFabSpecs[0].ZZHAFE,
                                                                        Zzshnk: oFabSpecs[0].ZZSHNK,
                                                                        Zzcfwa: oFabSpecs[0].ZZCFWA,
                                                                        Zzchng: oFabSpecs[0].ZZCHNG,
                                                                        Zzstan: oFabSpecs[0].ZZSTAN,
                                                                        Zzcfcw: oFabSpecs[0].ZZCFCW,
                                                                        Zzdry: oFabSpecs[0].ZZDRY,
                                                                        Zzreq1: oFabSpecs[0].ZZREQ1,
                                                                        Zzreq2: oFabSpecs[0].ZZREQ2,
                                                                        Zzshrq: oFabSpecs[0].ZZSHRQ,
                                                                        Zzprmo: oFabSpecs[0].PLANMONTH.slice(5,7),
                                                                        Zzpryr: oFabSpecs[0].PLANMONTH.slice(0,4),
                                                                        Zzmakt: poitem.POADDTLDESC
                                                                    })
                                                                }
                                                            }

                                                            // me.getView().getModel("potol").getData()[item.GROUP]
                                                            // .forEach(tol => {           
                                                            //     oParamCPOTolData.push({
                                                            //         EBELN: oResult.EReturnno,
                                                            //         EBELP: poitem.ITEM,
                                                            //         WEMNG: tol.WEMNG,
                                                            //         FOCQTY: tol.FOCQTY,
                                                            //         TOLALLOWEDIT: tol.TOLALLOWEDIT,
                                                            //         QTYMIN: tol.QTYMIN,
                                                            //         QTYMAX: tol.QTYMAX,
                                                            //         UNTTOMIN: tol.UNTTOMIN,
                                                            //         UNTTOMAX: tol.UNTTOMAX,
                                                            //         UEBTOMIN: tol.UEBTOMIN,
                                                            //         UEBTOMAX: tol.UEBTOMAX,
                                                            //     })
                                                            // })
                                                        })
            
                                                    var vCondVal = me.getView().getModel("discrates").getData()[item.GROUP].length === 0 ? "" : me.getView().getModel("discrates").getData()[item.GROUP][0].OKbetr;
                                                    var oParamCPOCondData = [{
                                                        CondType: "RL01",
                                                        CondValue: vCondVal === "" ? "0" : vCondVal, 
                                                        Currency: item.CURR,
                                                        CurrencyIso:  item.CURR
                                                    }]
    
                                                    oParamCPO["PONumber"] = "";
                                                    oParamCPO["No_Price_From_PO"] = wInforec ? "" : "X";
                                                    oParamCPO['N_CreatePOHdrParam'] = oParamCPOHdrData;
                                                    oParamCPO['N_CreatePOHdrTextParam'] = oParamCPOHdrTextData;
                                                    oParamCPO['N_CreatePOItemParam'] = oParamCPOItemData;
                                                    oParamCPO['N_CreatePOItemSchedParam'] = oParamCPOItemSchedData;
                                                    oParamCPO['N_CreatePOAddtlDtlsParam'] = oParamCPOAddtlDtlsData;
                                                    oParamCPO['N_CreatePOItemTextParam'] = [];
                                                    oParamCPO['N_CreatePOCondHdrParam'] = [];
                                                    oParamCPO['N_CreatePOCondParam'] = oParamCPOCondData;
                                                    oParamCPO['N_CreatePOClosePRParam'] = oParamCPOClosePRData;
                                                    oParamCPO['N_CreatePOReturn'] = [];
                                                        
                                                    console.log(oParamCPO);
                                                    oModel.create("/CreatePOSet", oParamCPO, {
                                                        method: "POST",
                                                        success: function(oResult, oResponse) {
                                                            iCounter++;
                                                            me.closeLoadingDialog();
                                                            console.log(oResult);
                                                            var oRetMsgs = oResult.N_CreatePOReturn.results;
                                                            var sRetMSg = "";
                                                            var sActiveGroup = me.getView().getModel("ui").getData().activeGroup; 

                                                            oRetMsgs.forEach(msg => {
                                                                if (msg.Type === "S") {
                                                                    sRetMSg = msg.Type + ": " + msg.Message;
                                                                }
                                                                else if (msg.Type === "E") {
                                                                    sRetMSg = sRetMSg + msg.Type + ": " +  msg.Message + "\r\n";
                                                                }
                                                            })
    
                                                            me._aCreatePOResult.forEach((item, index) => {
                                                                if (item.GROUP === sActiveGroup) {
                                                                    me._aCreatePOResult.splice(index, 1);
                                                                } 
                                                            })

                                                            me._aCreatePOResult.push({
                                                                GROUP: item.GROUP,
                                                                VENDOR: item.VENDOR,
                                                                PURCHORG: item.PURCHORG,
                                                                PURCHGRP: item.PURCHGRP,
                                                                STATUS: oRetMsgs[0].Type === "S" ? "CREATED" : "ERROR",
                                                                REMARKS: sRetMSg //oRetMsgs[0].Type + ": " + oRetMsgs[0].Message
                                                            })
    
                                                            if (me._toExtend) me.loadExtendPODialog.close();
                                                            var oHeaderData = me.getView().getModel("header").getData();

                                                            if (oRetMsgs[0].Type === "S") {
                                                                item.STATUS = "CREATED";
                                                                me._poCreated = true;
                                                                me.savePOTolerance(sPONo);
                                                                // me._oModel.setUseBatch(true);
                                                                // me._oModel.setDeferredGroups(["update"]);

                                                                // var mParameters = { groupId:"update" }

                                                                // oParamCPOTolData.forEach(tol => {
                                                                //     me._oModel.create("/PODataSet", tol, mParameters);
                                                                // })

                                                                // me._oModel.submitChanges({
                                                                //     groupId: "update",
                                                                //     success: function (oData, oResponse) { },
                                                                //     error: function () { }
                                                                // })

                                                                if (oHeaderData.length >= ((+item.GROUP) + 1)) {
                                                                    //next group
                                                                    // me.closeLoadingDialog();
                                                                    // MessageBox.information(oRetMsgs[0].Type + ": " + oRetMsgs[0].Message);
                                                                    // me.showMessage(oRetMsgs[0].Type + ": " + oRetMsgs[0].Message, 500);
                                                                    // me.onNextGroup(((+item.GROUP) + 1 ) + "");

                                                                    MessageBox.information(oRetMsgs[0].Type + ": " + oRetMsgs[0].Message, {
                                                                        onClose: function(oAction) { me.onNextGroup(((+item.GROUP) + 1 ) + "");  }
                                                                    });
                                                                }
                                                                else {
                                                                    me.showGeneratePOResult();
                                                                }
                                                            }
                                                            else {
                                                                MessageBox.error(sRetMSg);
                                                            }
                                                        },
                                                        error: function(err) {
                                                            iCounter++;
                                                            me.closeLoadingDialog();
                                                            MessageBox.information(err);
                                                        }
                                                    });
                                                }
                                            },
                                            error: function(err) {
                                                iCounter++;
                                                me.closeLoadingDialog();
                                                MessageBox.information(err);
                                                // me._aCreatePOResult.push({
                                                //     GROUP: item.GROUP,
                                                //     VENDOR: item.VENDOR,
                                                //     PURCHORG: item.PURCHORG,
                                                //     PURCHGRP: item.PURCHGRP,
                                                //     REMARKS: err
                                                // })
        
                                                // if (iCounter === me.getView().getModel("header").getData().length) {
                                                //     me.showGeneratePOResult();
                                                // }
                                            }
                                        });
                                    }
                                },
                                error: function (err) { 
                                    iCounter++;
                                    me.closeLoadingDialog();
                                    MessageBox.information(err);
                                    // me._aCreatePOResult.push({
                                    //     GROUP: item.GROUP,
                                    //     VENDOR: item.VENDOR,
                                    //     PURCHORG: item.PURCHORG,
                                    //     PURCHGRP: item.PURCHGRP,
                                    //     REMARKS: err
                                    // })
        
                                    // if (iCounter === me.getView().getModel("header").getData().length) {
                                    //     me.showGeneratePOResult();
                                    // }
                                }
                            });                        
                        }, 500);
                    })
                }
            }
            else {
                MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_CHECK_INVALID_ENTRIES"]);
            }
        },

        onValidateExtendPO: async function(oEvent){
            // this._aCreatePOResult = [];
            if (this._validationErrors.length === 0) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var vSBU = this.getOwnerComponent().getModel("UI_MODEL").getData().sbu;
                var bProceed = true;
    
                var extendPOEntitySet = "/ExtendPO";
                var extendPOModel = this.getOwnerComponent().getModel();
                var resultPOExtend = [];
                var validPOExists = false;
    
                this._toExtend = false;
    
                this.byId("headerForm").getFormContainers().forEach(c => {
                    c.getFormElements().forEach(e => {
                        if (e.mAggregations.label.mProperties !== undefined) {
                            if (e.mAggregations.label.mProperties.required) {
                                if (e.mAggregations.fields[0].mProperties.value === "") {
                                    bProceed = false;
                                    e.mAggregations.fields[0].setValueState("Error");
                                }
                                else {
                                    e.mAggregations.fields[0].setValueState("None");
                                }
                            }
                        }
    
                    })
                })
    
                // this.getView().getModel("grpheader").getData().forEach(item => {
                //     if (item.PAYTERMS === "" || item.INCOTERMS == "" || item.DESTINATION == "" || item.SHIPMODE == "") {
                //         bProceed = false;
                //     }
                // })
    
                if (bProceed) {
                    this.getView().getModel("detail").getData().forEach(item => {
                        if (item.DELVDATE === "" || item.BASEPOQTY == "" || item.GROSSPRICE == "") {
                            bProceed = false;
                        }
                    })
                }

                me.showLoadingDialog('Processing...');
                bProceed = await this.checkSourceList(this);
                
                if (!bProceed) {
                    me.closeLoadingDialog();
                    return;
                }
    
                if (bProceed) {
                    var iCounter = 0;
    
                    var result = new Promise((resolve, reject)=>{
                        setTimeout(() => {
                            this.getView().getModel("grpheader").getData().forEach(item => {
                                if (!isNaN(item.VENDOR)) {
                                    while (item.VENDOR.length < 10) item.VENDOR = "0" + item.VENDOR;
                                }
                                var PODate = sapDateFormat.format(new Date(item.PODATE)) + "T00:00:00";
                                var filter = encodeURIComponent("(VENDOR='"+item.VENDOR+"',PURCHGRP='" + item.PURCHGRP +"',PURCHORG='"+ item.PURCHORG +"',SHIPTOPLANT='"+ item.SHIPTOPLANT +"',PURCHPLANT='"+ item.PURCHPLANT +"',PODT=datetime'"+ PODate +"')")

                                extendPOModel.read("/ExtendPO"+filter , {
                                    success: function (oData, oResponse) {
                                        console.log(oData)
                                        oData.PODT = dateFormat.format(new Date(oData.PODT));
                                        resultPOExtend.push(oData);
                                        validPOExists = true;
                                        resolve(resultPOExtend);
                                    },
                                    error: function() {
                                        resolve("Error");
                                    }
                                });
                            })
                        }, 500);
                    });
                    await result;
                    me.closeLoadingDialog();
                    if(validPOExists){
                        var oJSONModel = new JSONModel();
                        this._poNO = resultPOExtend.at(0).PONO;
                        var extendPOData = {
                            Title: "Create Purchase Order: Extension Option",
                            Text: "PO of today's date already exists",
                            POLabel: "Purchase Order",
                            VendorLabel: "Vendor",
                            PurchGrpLabel: "Purchasing Group",
                            PONO: resultPOExtend.at(0).PONO,
                            VENDOR: resultPOExtend.at(0).VENDOR,
                            PURCHGRP: resultPOExtend.at(0).PURCHGRP,
                        }
                        
                        oJSONModel.setData(extendPOData);
    
                        this.loadExtendPODialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ExtendPODialog", this);
                        this.loadExtendPODialog.setModel(oJSONModel);
                        this.getView().addDependent(this.loadExtendPODialog);
                        this.loadExtendPODialog.open();
                        this._toExtend = true;
                    }else{
                        //code here
                        this.onGeneratePO();
                    }
                }
                else{
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_CREATEPO_CHECK_REQD"]);
                }
            }
            else {
                MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_CHECK_INVALID_ENTRIES"]);
            }
        },

        async extendPO() {
            var me = this;
            var poNo = this.getView().getModel("grpheader").getData()[0].PONO;
            var extendPopPOEntitySet = "/ExtendPOPopulateDtlsSet";
            var extendPopPOModel = this.getOwnerComponent().getModel();
            var resultExtendPop = [];
            var promiseResult;
            
            var rfcModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
            var oParamInitParam = {};
            var oParamDataPO = [];
            var oParamCPOClosePRData = [];

            // var delDt; 
            var ebelpArray = [];
            var ebelpLastCount = 0;

            this._aParamLockPOdata = [];

            this._aParamLockPOdata.push({
                Pono: poNo
            });

            this.showLoadingDialog('Processing...');

            var bProceed = await this.onPOLock();
            if (!bProceed) return;

            // this.getView().getModel("detail").getData().forEach(item => {
            //     delDt = item.DELVDATE
            // })

            promiseResult = new Promise((resolve, reject)=>{
                extendPopPOModel.read(extendPopPOEntitySet , { 
                    urlParameters: {
                        "$filter": "EBELN eq '"+ poNo +"'"
                    },
                    success: function (oData, oResponse) {

                        oData.results.forEach((item, index) => {
                            if (item.BEDAT !== null)
                                item.BEDAT = dateFormat.format(new Date(item.BEDAT));
                        })

                        resultExtendPop.push(oData.results);
                        resolve(true);
                    },
                    error: function(error) {
                        resolve(false);
                        MessageBox.error(me.getView().getModel("ddtext").getData()["INFO_ERROR"] + " " + error.message);
                        me.closeLoadingDialog();
                    }
                });
            });

            await promiseResult;

            if (!promiseResult) return;

            oParamInitParam = {
                IPoNumber: poNo,
                IDoDownload: "",
                IChangeonlyHdrplants: "",
            }
            //get last EBELP
            if (resultExtendPop[0] !== undefined) {
                for(var x = 0; x < resultExtendPop[0].length; x++) {
                    ebelpArray.push(resultExtendPop[0][x].EBELP);
                }

                ebelpArray.sort(function(a, b){return b - a});
                ebelpLastCount = ebelpArray[0];
                ebelpLastCount = String(parseInt(ebelpLastCount) + 10);

                if(ebelpLastCount != "" || ebelpLastCount != null){
                    while(ebelpLastCount.length < 5) ebelpLastCount = "0" + ebelpLastCount.toString();
                }

                for(var x = 0; x < resultExtendPop[0].length; x++) {
                    oParamDataPO.push({
                        Bedat     : sapDateFormat.format(new Date(resultExtendPop[0][x].BEDAT)) + "T00:00:00",
                        Bsart     : resultExtendPop[0][x].BSART,
                        Banfn     : resultExtendPop[0][x].BANFN,
                        Bnfpo     : resultExtendPop[0][x].BNFPO,
                        Ekorg     : resultExtendPop[0][x].EKORG,
                        Lifnr     : resultExtendPop[0][x].LIFNR,
                        Ekgrp     : resultExtendPop[0][x].EKGRP,
                        Inco1     : resultExtendPop[0][x].INCO1,
                        Inco2     : resultExtendPop[0][x].INCO2,
                        Waers     : resultExtendPop[0][x].WAERS,
                        Zterm     : resultExtendPop[0][x].ZTERM,
                        Ebeln     : resultExtendPop[0][x].EBELN,
                        Ebelp     : resultExtendPop[0][x].EBELP,
                        Bukrs     : resultExtendPop[0][x].BUKRS,
                        Werks     : resultExtendPop[0][x].WERKS,
                        Unsez     : resultExtendPop[0][x].UNSEZ,
                        Matnr     : resultExtendPop[0][x].MATNR,
                        Txz01     : resultExtendPop[0][x].TXZ01,
                        Menge     : resultExtendPop[0][x].MENGE,
                        Meins     : resultExtendPop[0][x].MEINS,
                        Netpr     : resultExtendPop[0][x].NETPR,
                        Peinh     : resultExtendPop[0][x].PEINH,
                        Bprme     : resultExtendPop[0][x].BPRME,
                        Repos     : resultExtendPop[0][x].REPOS,
                        Webre     : resultExtendPop[0][x].WEBRE,
                        // Eindt     : sapDateFormat.format(new Date(delDt)) + "T00:00:00", //Delivery Date
                        Evers     : resultExtendPop[0][x].EVERS,
                        Uebto     : resultExtendPop[0][x].UEBTO,
                        Untto     : resultExtendPop[0][x].UNTTO,
                        Uebtk     : resultExtendPop[0][x].UEBTK,
                        Charg     : resultExtendPop[0][x].CHARG,
                        // Elikz     : resultExtendPop[0][x].ELIKZ,
                        // DeleteRec : resultExtendPop[0][x].LOEKZ
                    });

                    oParamCPOClosePRData.push({
                        Banfn: resultExtendPop[0][x].BANFN,
                        Bnfpo: resultExtendPop[0][x].BNFPO
                    })
                }

                this.byId("detailTab").getModel("detail").getData().forEach(item => {
                    oParamDataPO.push({
                        Bedat     : sapDateFormat.format(new Date(resultExtendPop[0][0].BEDAT)) + "T00:00:00",
                        Bsart     : resultExtendPop[0][0].BSART,
                        Banfn     : item.PRNUMBER,
                        Bnfpo     : item.PRITEMNO,
                        Ekorg     : resultExtendPop[0][0].EKORG,
                        Lifnr     : resultExtendPop[0][0].LIFNR,
                        Ekgrp     : resultExtendPop[0][0].EKGRP,
                        Inco1     : resultExtendPop[0][0].INCO1,
                        Inco2     : resultExtendPop[0][0].INCO2,
                        Waers     : resultExtendPop[0][0].WAERS,
                        Zterm     : resultExtendPop[0][0].ZTERM,
                        Ebeln     : resultExtendPop[0][0].EBELN,
                        Ebelp     : ebelpLastCount,
                        Bukrs     : resultExtendPop[0][0].BUKRS,
                        Werks     : resultExtendPop[0][0].WERKS,
                        Unsez     : resultExtendPop[0][0].UNSEZ,
                        Matnr     : item.MATERIALNO,
                        Txz01     : item.GMCDESCEN.substring(0, 40),
                        Menge     : item.ORDERPOQTY + "",
                        Meins     : item.ORDUOM,
                        Netpr     : item.GROSSPRICE,
                        Peinh     : item.PER,
                        Bprme     : item.ORDERPRICEUNIT,
                        Repos     : resultExtendPop[0][0].REPOS,
                        Webre     : item.GRBASEDIV,
                        // Eindt     : sapDateFormat.format(new Date(delDt)) + "T00:00:00", //Delivery Date
                        Evers     : resultExtendPop[0][0].EVERS,
                        Uebto     : item.OVERDELTOL,
                        Untto     : item.UNDERDELTOL,
                        Uebtk     : item.UNLI,
                        Charg     : item.IONUMBER,
                        // Elikz     : resultExtendPop[0][x].ELIKZ,
                        // DeleteRec : resultExtendPop[0][x].LOEKZ
                    });

                    ebelpLastCount = String(parseInt(ebelpLastCount) + 10);

                    if(ebelpLastCount != "" || ebelpLastCount != null){
                        while(ebelpLastCount.length < 5) ebelpLastCount = "0" + ebelpLastCount.toString();
                    }

                    oParamCPOClosePRData.push({
                        Banfn: item.PRNUMBER,
                        Bnfpo: item.PRITEMNO
                    })
                })

                oParam = oParamInitParam;
                oParam['N_ChangePOItemParam'] = oParamDataPO;
                oParam['N_ChangePOClosePRParam'] = oParamCPOClosePRData;
                oParam['N_ChangePOReturn'] = [];
                console.log(oParam);
                
                var bSuccess = "", sRetMessage = "";
                var oCurrHeaderData = me.getView().getModel("grpheader").getData();

                promiseResult = new Promise((resolve, reject)=>{
                    rfcModel.create("/ChangePOSet", oParam, {
                        method: "POST",
                        success: function(oData, oResponse) {
                            console.log(oData)
                            if(oData.N_ChangePOReturn.results.length > 0){
                                me.closeLoadingDialog();
                                sRetMessage = oData.N_ChangePOReturn.results[0].Msgv1;
                                me._poCreated = true;

                                var sRetMSg = "";

                                oData.N_ChangePOReturn.results.forEach(msg => {
                                    if (msg.Msgtyp === "S") {
                                        sRetMSg = msg.Msgtyp + ": " + msg.Msgv1;
                                    }
                                    else if (msg.Msgtyp === "E") {
                                        sRetMSg = sRetMSg + msg.Msgtyp + ": " +  msg.Msgv1 + "\r\n";
                                    }
                                })

                                me._aCreatePOResult.forEach((item, index) => {
                                    if (item.GROUP === oCurrHeaderData[0].GROUP) {
                                        me._aCreatePOResult.splice(index, 1);
                                    } 
                                })

                                me._aCreatePOResult.push({
                                    GROUP: oCurrHeaderData[0].GROUP,
                                    VENDOR: oCurrHeaderData[0].VENDOR,
                                    PURCHORG: oCurrHeaderData[0].PURCHORG,
                                    PURCHGRP: oCurrHeaderData[0].PURCHGRP,
                                    REMARKS: sRetMSg //oData.N_ChangePOReturn.results[0].Msgtyp + ": " + oData.N_ChangePOReturn.results[0].Msgv1
                                })                                
                                resolve();
                            }else{
                                me.closeLoadingDialog();
                                MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_DATA_SAVE"]);
                                resolve();
                            }

                            bSuccess = oData.OutSuccess;
                            me.onPOUnlock();
                        },
                        error: function(error) {
                            me.closeLoadingDialog();
                            MessageBox.error(me.getView().getModel("ddtext").getData()["INFO_ERROR"] + " " + error.message);
                            resolve();
                            me.onPOUnlock();
                        }
                    })
                });

                await promiseResult;

                if (bSuccess === "X") {
                    var oHeaderData = me.getView().getModel("header").getData();

                    if (oHeaderData.length >= ((+oCurrHeaderData[0].GROUP) + 1)) {
                        //next group
                        MessageBox.information(sRetMessage, {
                            onClose: function(oAction) { me.onNextGroup(((+oCurrHeaderData[0].GROUP) + 1 ) + ""); }
                        });                        
                    }
                    else {
                        me.showGeneratePOResult();
                    }                    
                }
                else {
                    MessageBox.information(sRetMessage);
                }
            } else {
                MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_DATA_SAVE"]);
            }
        },

        onExtendPO: async function() {
            var me = this;
            var poNo = this._poNO;
            var extendPopPOEntitySet = "/ExtendPOPopulateDtlsSet";
            var extendPopPOModel = this.getOwnerComponent().getModel();
            var resultExtendPop = [];
            var promiseResult;
            
            var rfcModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
            var oParamInitParam = {};
            var oParamDataPO = [];
            var oParamCPOClosePRData = [];

            var delDt; 
            var ebelpArray = [];
            var ebelpLastCount = 0;

            this._aParamLockPOdata = [];

            this._aParamLockPOdata.push({
                Pono: poNo
            });

            this.showLoadingDialog('Processing...');

            var bProceed = await this.onPOLock();
            if (!bProceed) return;

            this.getView().getModel("detail").getData().forEach(item => {
                delDt = item.DELVDATE
            })

            promiseResult = new Promise((resolve, reject)=>{
                extendPopPOModel.read(extendPopPOEntitySet , { 
                    urlParameters: {
                        "$filter": "EBELN eq '"+ poNo +"'"
                    },
                    success: function (oData, oResponse) {

                        oData.results.forEach((item, index) => {
                            if (item.BEDAT !== null)
                                item.BEDAT = dateFormat.format(new Date(item.BEDAT));
                        })

                        resultExtendPop.push(oData.results);
                        resolve(true);
                    },
                    error: function(error) {
                        resolve(false);
                        MessageBox.error(me.getView().getModel("ddtext").getData()["INFO_ERROR"] + " " + error.message);
                        me.closeLoadingDialog();
                    }
                });
            });

            await promiseResult;

            if (!promiseResult) return;

            oParamInitParam = {
                IPoNumber: poNo,
                IDoDownload: "",
                IChangeonlyHdrplants: "",
            }
            //get last EBELP
            if (resultExtendPop[0] !== undefined) {
                for(var x = 0; x < resultExtendPop[0].length; x++) {
                    ebelpArray.push(resultExtendPop[0][x].EBELP);
                }

                ebelpArray.sort(function(a, b){return b - a});
                ebelpLastCount = ebelpArray[0];
                ebelpLastCount = String(parseInt(ebelpLastCount) + 10);

                if(ebelpLastCount != "" || ebelpLastCount != null){
                    while(ebelpLastCount.length < 5) ebelpLastCount = "0" + ebelpLastCount.toString();
                }

                for(var x = 0; x < resultExtendPop[0].length; x++) {
                    oParamDataPO.push({
                        Bedat     : sapDateFormat.format(new Date(resultExtendPop[0][x].BEDAT)) + "T00:00:00",
                        Bsart     : resultExtendPop[0][x].BSART,
                        Banfn     : resultExtendPop[0][x].BANFN,
                        Bnfpo     : resultExtendPop[0][x].BNFPO,
                        Ekorg     : resultExtendPop[0][x].EKORG,
                        Lifnr     : resultExtendPop[0][x].LIFNR,
                        Ekgrp     : resultExtendPop[0][x].EKGRP,
                        Inco1     : resultExtendPop[0][x].INCO1,
                        Inco2     : resultExtendPop[0][x].INCO2,
                        Waers     : resultExtendPop[0][x].WAERS,
                        Zterm     : resultExtendPop[0][x].ZTERM,
                        Ebeln     : resultExtendPop[0][x].EBELN,
                        Ebelp     : resultExtendPop[0][x].EBELP,
                        Bukrs     : resultExtendPop[0][x].BUKRS,
                        Werks     : resultExtendPop[0][x].WERKS,
                        Unsez     : resultExtendPop[0][x].UNSEZ,
                        Matnr     : resultExtendPop[0][x].MATNR,
                        Txz01     : resultExtendPop[0][x].TXZ01,
                        Menge     : resultExtendPop[0][x].MENGE,
                        Meins     : resultExtendPop[0][x].MEINS,
                        Netpr     : resultExtendPop[0][x].NETPR,
                        Peinh     : resultExtendPop[0][x].PEINH,
                        Bprme     : resultExtendPop[0][x].BPRME,
                        Repos     : resultExtendPop[0][x].REPOS,
                        Webre     : resultExtendPop[0][x].WEBRE,
                        // Eindt     : sapDateFormat.format(new Date(delDt)) + "T00:00:00", //Delivery Date
                        Evers     : resultExtendPop[0][x].EVERS,
                        Uebto     : resultExtendPop[0][x].UEBTO,
                        Untto     : resultExtendPop[0][x].UNTTO,
                        Uebtk     : resultExtendPop[0][x].UEBTK,
                        Charg     : resultExtendPop[0][x].CHARG,
                        // Elikz     : resultExtendPop[0][x].ELIKZ,
                        // DeleteRec : resultExtendPop[0][x].LOEKZ
                    });

                    oParamCPOClosePRData.push({
                        Banfn: resultExtendPop[0][x].BANFN,
                        Bnfpo: resultExtendPop[0][x].BNFPO
                    })
                }

                this.byId("detailTab").getModel("detail").getData().forEach(item => {
                    oParamDataPO.push({
                        Bedat     : sapDateFormat.format(new Date(resultExtendPop[0][0].BEDAT)) + "T00:00:00",
                        Bsart     : resultExtendPop[0][0].BSART,
                        Banfn     : item.PRNUMBER,
                        Bnfpo     : item.PRITEMNO,
                        Ekorg     : resultExtendPop[0][0].EKORG,
                        Lifnr     : resultExtendPop[0][0].LIFNR,
                        Ekgrp     : resultExtendPop[0][0].EKGRP,
                        Inco1     : resultExtendPop[0][0].INCO1,
                        Inco2     : resultExtendPop[0][0].INCO2,
                        Waers     : resultExtendPop[0][0].WAERS,
                        Zterm     : resultExtendPop[0][0].ZTERM,
                        Ebeln     : resultExtendPop[0][0].EBELN,
                        Ebelp     : ebelpLastCount,
                        Bukrs     : resultExtendPop[0][0].BUKRS,
                        Werks     : resultExtendPop[0][0].WERKS,
                        Unsez     : resultExtendPop[0][0].UNSEZ,
                        Matnr     : item.MATERIALNO,
                        Txz01     : item.GMCDESCEN.substring(0, 40),
                        Menge     : item.ORDERPOQTY + "",
                        Meins     : item.ORDUOM,
                        Netpr     : item.GROSSPRICE,
                        Peinh     : item.PER,
                        Bprme     : item.ORDERPRICEUNIT,
                        Repos     : resultExtendPop[0][0].REPOS,
                        Webre     : item.GRBASEDIV,
                        // Eindt     : sapDateFormat.format(new Date(delDt)) + "T00:00:00", //Delivery Date
                        Evers     : resultExtendPop[0][0].EVERS,
                        Uebto     : item.OVERDELTOL,
                        Untto     : item.UNDERDELTOL,
                        Uebtk     : item.UNLI,
                        Charg     : item.IONUMBER,
                        // Elikz     : resultExtendPop[0][x].ELIKZ,
                        // DeleteRec : resultExtendPop[0][x].LOEKZ
                    });

                    ebelpLastCount = String(parseInt(ebelpLastCount) + 10);

                    if(ebelpLastCount != "" || ebelpLastCount != null){
                        while(ebelpLastCount.length < 5) ebelpLastCount = "0" + ebelpLastCount.toString();
                    }

                    oParamCPOClosePRData.push({
                        Banfn: item.PRNUMBER,
                        Bnfpo: item.PRITEMNO
                    })
                })

                oParam = oParamInitParam;
                oParam['N_ChangePOItemParam'] = oParamDataPO;
                oParam['N_ChangePOClosePRParam'] = oParamCPOClosePRData;
                oParam['N_ChangePOReturn'] = [];
                console.log(oParam);
                
                var bSuccess = "", sRetMessage = "";
                var oCurrHeaderData = me.getView().getModel("grpheader").getData();

                promiseResult = new Promise((resolve, reject)=>{
                    rfcModel.create("/ChangePOSet", oParam, {
                        method: "POST",
                        success: function(oData, oResponse) {
                            console.log(oData)
                            if(oData.N_ChangePOReturn.results.length > 0){
                                me.closeLoadingDialog();
                                sRetMessage = oData.N_ChangePOReturn.results[0].Msgv1;
                                me.loadExtendPODialog.close();
                                me._poCreated = true;

                                var sRetMSg = "";

                                oData.N_ChangePOReturn.results.forEach(msg => {
                                    if (msg.Msgtyp === "S") {
                                        sRetMSg = msg.Msgtyp + ": " + msg.Msgv1;
                                    }
                                    else if (msg.Msgtyp === "E") {
                                        sRetMSg = sRetMSg + msg.Msgtyp + ": " +  msg.Msgv1 + "\r\n";
                                    }
                                })

                                me._aCreatePOResult.forEach((item, index) => {
                                    if (item.GROUP === oCurrHeaderData[0].GROUP) {
                                        me._aCreatePOResult.splice(index, 1);
                                    } 
                                })

                                me._aCreatePOResult.push({
                                    GROUP: oCurrHeaderData[0].GROUP,
                                    VENDOR: oCurrHeaderData[0].VENDOR,
                                    PURCHORG: oCurrHeaderData[0].PURCHORG,
                                    PURCHGRP: oCurrHeaderData[0].PURCHGRP,
                                    REMARKS: sRetMSg //oData.N_ChangePOReturn.results[0].Msgtyp + ": " + oData.N_ChangePOReturn.results[0].Msgv1
                                })                                
                                resolve();
                            }else{
                                me.closeLoadingDialog();
                                MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_DATA_SAVE"]);
                                resolve();
                            }

                            bSuccess = oData.OutSuccess;
                            me.onPOUnlock();
                        },
                        error: function(error) {
                            me.closeLoadingDialog();
                            MessageBox.error(me.getView().getModel("ddtext").getData()["INFO_ERROR"] + " " + error.message);
                            resolve();
                            me.onPOUnlock();
                        }
                    })
                });

                await promiseResult;

                if (bSuccess === "X") {
                    var oHeaderData = me.getView().getModel("header").getData();

                    if (oHeaderData.length >= ((+oCurrHeaderData[0].GROUP) + 1)) {
                        //next group
                        MessageBox.information(sRetMessage, {
                            onClose: function(oAction) { me.onNextGroup(((+oCurrHeaderData[0].GROUP) + 1 ) + ""); }
                        });                        
                    }
                    else {
                        me.showGeneratePOResult();
                    }                    
                }
                else {
                    MessageBox.information(sRetMessage);
                }
            } else {
                MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_DATA_SAVE"]);
            }
        },

        onCancelExtendPODialog: function(oEvent){
            this.loadExtendPODialog.close();
        },

        onPrevPO: function(oEvent) {
            var vCurrGrp = this.getView().getModel("ui").getData().activeGroup;
            var vNextGrp = (+vCurrGrp) - 1;
            var oHeaderData = this.getView().getModel("header").getData();
            var vStatus = oHeaderData.filter(fItem => +fItem.GROUP === vNextGrp)[0].STATUS;
            var vMin = "0";
            var vMax = oHeaderData.length + "";
            
            oHeaderData.forEach(item => {
                if (item.STATUS === "NEW") {
                    if ( vMin === "0") { vMin = item.GROUP }
                    vMax = item.GROUP;
                }
            })

            if (vNextGrp === +vMin && vStatus === "NEW") {
                this.onNextGroup(vNextGrp+"");
            }
            else {
                while (vStatus !== "NEW") {
                    vNextGrp++;
                    vStatus = oHeaderData.filter(fItem => +fItem.GROUP === vNextGrp)[0].STATUS;
                }

                this.onNextGroup(vNextGrp+"");
            }

            if (+vMin === vNextGrp || vNextGrp === 1) { 
                this.byId("btnPrevPO").setEnabled(false); 

                if (+vMax === vNextGrp || vNextGrp === oHeaderData.length) { this.byId("btnNextPO").setEnabled(false); }
                else { this.byId("btnNextPO").setEnabled(true); }
            }
            else if (+vMax === vNextGrp || vNextGrp === oHeaderData.length) { 
                this.byId("btnNextPO").setEnabled(false); 

                if (+vMin === vNextGrp || vNextGrp === 1) { this.byId("btnPrevPO").setEnabled(false); }
                else { this.byId("btnPrevPO").setEnabled(true); }
            }
        },

        onNextPO: function(oEvent) {
            var vCurrGrp = this.getView().getModel("ui").getData().activeGroup;
            var vNextGrp = (+vCurrGrp) + 1;
            var oHeaderData = this.getView().getModel("header").getData();
            var vStatus = oHeaderData.filter(fItem => +fItem.GROUP === vNextGrp)[0].STATUS;
            var vMax = oHeaderData.length + "";
            var vMin = "0";
            
            oHeaderData.forEach(item => {
                if (item.STATUS === "NEW") {
                    if ( vMin === "0") { vMin = item.GROUP }
                    vMax = item.GROUP;
                }
            })

            if (vNextGrp === +vMax && vStatus === "NEW") {
                this.onNextGroup(vNextGrp+"");
            }
            else {
                while (vStatus !== "NEW") {
                    vNextGrp++;
                    vStatus = oHeaderData.filter(fItem => +fItem.GROUP === vNextGrp)[0].STATUS;
                }

                this.onNextGroup(vNextGrp+"");
            }

            if (+vMax === vNextGrp || vNextGrp === oHeaderData.length) { 
                this.byId("btnNextPO").setEnabled(false); 

                if (+vMin === vNextGrp || vNextGrp === 1) { this.byId("btnPrevPO").setEnabled(false); }
                else { this.byId("btnPrevPO").setEnabled(true); }
            }
            else if (+vMin === vNextGrp || vNextGrp === 1) { 
                this.byId("btnPrevPO").setEnabled(false); 

                if (+vMax === vNextGrp || vNextGrp === oHeaderData.length) { this.byId("btnNextPO").setEnabled(false); }
                else { this.byId("btnNextPO").setEnabled(true); }
            }
        }, 
        
        onNextGroup(arg) {
            this._validationErrors = [];
            var me = this;
            this.showLoadingDialog("Loading group " + arg + "...");
            this.setFormInputValueHelp();

            setTimeout(() => {
                me.closeLoadingDialog();

                var oHeaderData = me.getView().getModel("header").getData();
                var aGrpHeaderData = oHeaderData.filter(grp => grp.GROUP === arg);
                me.getView().getModel("grpheader").setProperty("/", aGrpHeaderData);
                me.getView().getModel("ui").setProperty("/activeGroup", arg);
    
                // var oJSONModel = new JSONModel();
                var oDataDetail = me.getOwnerComponent().getModel("CREATEPO_MODEL").getData().detail.filter(fItem => fItem.GROUP === arg);
                me.getView().getModel("detail").setProperty("/", oDataDetail);
                // me.byId("detailTab").getModel().setProperty("/", oDataDetail);
                me.byId("detailTab").setModel(new JSONModel(oDataDetail), "detail");
                me.byId("detailTab").bindRows({path: "detail>/"});

                if (aGrpHeaderData[0].EXTEND) {
                    this.byId("fldPAYTERMS").setEnabled(false);
                    this.byId("fldINCOTERMS").setEnabled(false);
                    this.byId("fldDESTINATION").setEnabled(false);
                    this.byId("fldSHIPMODE").setEnabled(false);
                    this.byId("btnHdrTxt").setVisible(false);
                }
                else {
                    this.byId("fldPAYTERMS").setEnabled(true);
                    this.byId("fldINCOTERMS").setEnabled(true);
                    this.byId("fldDESTINATION").setEnabled(true);
                    this.byId("fldSHIPMODE").setEnabled(true);
                    this.byId("btnHdrTxt").setVisible(true);
                }
    
                this.getView().getModel("ui").setProperty("/title", aGrpHeaderData[0].EXTEND ? aGrpHeaderData[0].PONO + " " + this.getView().getModel("ddtext").getData()["POEXTEND"] : this.getView().getModel("ddtext").getData()["POCREATE"]);
                this.getView().getModel("ui").setProperty("/generatepo", aGrpHeaderData[0].EXTEND ? this.getView().getModel("ddtext").getData()["EXTENDPO"] : this.getView().getModel("ddtext").getData()["GENERATEPO"]);

                var oTable = me.byId("detailTab");
                var iGPCellIndex = -1;
    
                oTable.getRows()[0].getCells().forEach((cell, idx) => {
                    if (cell.getBindingInfo("value") !== undefined) {
                        if (cell.getBindingInfo("value").parts[0].path === "GROSSPRICE") iGPCellIndex = idx;
                    }
                })
                
                me.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === arg).forEach((item, index) => {
                    if (item.INFORECCHECK) { 
                        oTable.getRows()[index].getCells()[iGPCellIndex].setProperty("enabled", false);
                    }
                    else oTable.getRows()[index].getCells()[iGPCellIndex].setProperty("enabled", true);
                })

                var oHdrTxtTab = sap.ui.getCore().byId("ITB1");

                if (oHdrTxtTab !== undefined) {
                    oHdrTxtTab.setSelectedKey("remarks");

                    oHdrTxtTab.getItems().forEach(item => {
                        if (item.getProperty("key") === "fabspecs" && aGrpHeaderData[0].DOCTYPE !== "ZFAB") { item.setProperty("enabled", false) }
                        else { item.setProperty("enabled", true) }
                    });
                }
            }, 500);
        },

        onLoadGroup(arg) {
            this._validationErrors = [];
            var me = this;
            var oHeaderData = me.getView().getModel("header").getData();
            var aGrpHeaderData = oHeaderData.filter(grp => grp.GROUP === arg);
            var vStatus = aGrpHeaderData[0].STATUS;

            me.showLoadingDialog("Loading group " + arg + "...");
            this.setFormInputValueHelp();

            setTimeout(() => {
                me.getView().getModel("grpheader").setProperty("/", aGrpHeaderData);
                me.getView().getModel("ui").setProperty("/activeGroup", arg);

                // var oJSONModel = new JSONModel();
                var oDataDetail = me.getOwnerComponent().getModel("CREATEPO_MODEL").getData().detail.filter(fItem => fItem.GROUP === arg);
                me.getView().getModel("detail").setProperty("/", oDataDetail);
                // me.byId("detailTab").getModel().setProperty("/", oDataDetail);
                me.byId("detailTab").setModel(new JSONModel(oDataDetail), "detail");
                me.byId("detailTab").bindRows({path: "detail>/"});
                
                if (aGrpHeaderData[0].EXTEND) {
                    this.byId("fldPAYTERMS").setEnabled(false);
                    this.byId("fldINCOTERMS").setEnabled(false);
                    this.byId("fldDESTINATION").setEnabled(false);
                    this.byId("fldSHIPMODE").setEnabled(false);
                    this.byId("btnHdrTxt").setVisible(false);
                }
                else {
                    this.byId("fldPAYTERMS").setEnabled(true);
                    this.byId("fldINCOTERMS").setEnabled(true);
                    this.byId("fldDESTINATION").setEnabled(true);
                    this.byId("fldSHIPMODE").setEnabled(true);
                    this.byId("btnHdrTxt").setVisible(false);
                }

                this.getView().getModel("ui").setProperty("/title", aGrpHeaderData[0].EXTEND ? aGrpHeaderData[0].PONO + " " + this.getView().getModel("ddtext").getData()["POEXTEND"] : this.getView().getModel("ddtext").getData()["POCREATE"]);
                this.getView().getModel("ui").setProperty("/generatepo", aGrpHeaderData[0].EXTEND ? this.getView().getModel("ddtext").getData()["EXTENDPO"] : this.getView().getModel("ddtext").getData()["GENERATEPO"]);

                var oTable = me.byId("detailTab");
                var iGPCellIndex = -1;

                oTable.getRows()[0].getCells().forEach((cell, idx) => {
                    if (cell.getBindingInfo("value") !== undefined) {
                        if (cell.getBindingInfo("value").parts[0].path === "GROSSPRICE") iGPCellIndex = idx;
                    }
                })

                me.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === arg).forEach((item, index) => {
                    if (item.INFORECCHECK) { 
                        oTable.getRows()[index].getCells()[iGPCellIndex].setProperty("enabled", false);
                    }
                    else oTable.getRows()[index].getCells()[iGPCellIndex].setProperty("enabled", true);
                })

                var oHdrTxtTab = sap.ui.getCore().byId("ITB1");

                if (oHdrTxtTab !== undefined) {
                    oHdrTxtTab.setSelectedKey("remarks");

                    oHdrTxtTab.getItems().forEach(item => {
                        if (item.getProperty("key") === "fabspecs" && aGrpHeaderData[0].DOCTYPE !== "ZFAB") { item.setProperty("enabled", false) }
                        else { item.setProperty("enabled", true) }
                    });
                }

                if (me._GeneratePOGroupDialog) me._GeneratePOGroupDialog.close(); 
                if (me._GeneratePOResultDialog) me._GeneratePOResultDialog.close(); 
                me.closeLoadingDialog();
            }, 500);
        },

        onCancelPO: function(oEvent) {
            var me = this;
            var oHeaderData = this.getView().getModel("header").getData();
            var aHeaderData = this.getView().getModel("grpheader").getData();
            var sActiveGroup = this.getView().getModel("ui").getData().activeGroup; 
            var vMax = oHeaderData.length + "";
            var vNextGrp = (+sActiveGroup) + 1;
            var vMin = "0";
            
            this._aCreatePOResult.forEach((item, index) => {
                if (item.GROUP === sActiveGroup) {
                    this._aCreatePOResult.splice(index, 1);
                } 
            })

            this._aCreatePOResult.push({
                GROUP: sActiveGroup,
                VENDOR: aHeaderData[0].VENDOR,
                PURCHORG: aHeaderData[0].PURCHORG,
                PURCHGRP: aHeaderData[0].PURCHGRP,
                STATUS: "CANCELLED",
                REMARKS: aHeaderData[0].EXTEND ? "Extend PO cancelled." : "Generate PO cancelled."
            })

            oHeaderData.forEach(item => {
                if (item.GROUP === sActiveGroup) { item.STATUS = "CANCELLED" }
            })

            oHeaderData.forEach(item => {
                if (item.STATUS === "NEW") { vMax = item.GROUP }
            })

            if (oHeaderData.filter(fItem => fItem.STATUS === "NEW").length === 0) {
                this.showGeneratePOResult();
            }
            else if (vNextGrp > oHeaderData.length || vNextGrp > (+vMax)) {
                oHeaderData.forEach(item => {
                    if (item.STATUS === "NEW" && vMin === "0") { vMin = item.GROUP }
                })

                if (vMin === "0") { this.showGeneratePOResult(); }
                else { 
                    vNextGrp = (+vMin);
                    MessageBox.information(this.getView().getModel("ddtext").getData()["GENPOCANCEL"], {
                        onClose: function(oAction) { me.onNextGroup(vMin);  }
                    });
                }
            }
            else if (vNextGrp === (+vMax)) {
                MessageBox.information(this.getView().getModel("ddtext").getData()["GENPOCANCEL"], {
                    onClose: function(oAction) { me.onNextGroup(vNextGrp+""); }
                });
            }
            else {
                var vStatus = oHeaderData.filter(fItem => +fItem.GROUP === vNextGrp)[0].STATUS;

                if (vStatus === "NEW") {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["GENPOCANCEL"], {
                        onClose: function(oAction) { me.onNextGroup(vNextGrp+"");  }
                    });
                }
                else {
                    while (vStatus !== "NEW") {
                        vNextGrp++;
                        vStatus = oHeaderData.filter(fItem => +fItem.GROUP === vNextGrp)[0].STATUS;
                    }
    
                    MessageBox.information(this.getView().getModel("ddtext").getData()["GENPOCANCEL"], {
                        onClose: function(oAction) { me.onNextGroup(vNextGrp+"");  }
                    });
                }
            }

            if (vNextGrp === (+vMax)) {
                this.byId("btnNextPO").setEnabled(false); 
            }
            else { this.byId("btnNextPO").setEnabled(true); }

            if (vNextGrp === (+vMin)) {
                this.byId("btnPrevPO").setEnabled(false);
            }
            else { this.byId("btnPrevPO").setEnabled(true); }
        },

        onCancelAllPO: function(oEvent) {
            var oHeaderData = this.getView().getModel("header").getData();

            oHeaderData.filter(fItem => fItem.STATUS === "NEW").forEach(item => {
                if (this._aCreatePOResult.filter(fItem2 => fItem2.GROUP === item.GROUP).length > 0) {
                    this._aCreatePOResult.forEach(res => {
                        if (res.GROUP === item.GROUP) {
                            res.STATUS = "CANCELLED";
                            res.REMARKS = "Generate PO cancelled.";
                        }
                    })
                }
                else {
                    this._aCreatePOResult.push({
                        GROUP: item.GROUP,
                        VENDOR: item.VENDOR,
                        PURCHORG: item.PURCHORG,
                        PURCHGRP: item.PURCHGRP,
                        STATUS: "CANCELLED",
                        REMARKS: "Generate PO cancelled."
                    })
                }

                item.STATUS = "CANCELLED"
            })

            this.showGeneratePOResult();
        },
        
        showLoadingDialog(arg) {
            if (!this._LoadingDialog) {
                this._LoadingDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.LoadingDialog", this);
                this.getView().addDependent(this._LoadingDialog);
            }

            this._LoadingDialog.setText(arg);
            this._LoadingDialog.open();
        },

        closeLoadingDialog() {
            this._LoadingDialog.close();
        },

        showGeneratePOGroups() {
            this._aCreatePOResult = this._aCreatePOResult.sort((a,b) => (a.GROUP > b.GROUP ? 1 : -1));

            if (!this._GeneratePOGroupDialog) {
                this._GeneratePOGroupDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.GeneratePOGroupDialog", this);

                this._GeneratePOGroupDialog.setModel(
                    new JSONModel({
                        items: this._aCreatePOResult,
                        rowCount: this._aCreatePOResult.length < 7 ? 7 : this._aCreatePOResult.length
                    })
                )

                this.getView().addDependent(this._GeneratePOGroupDialog);
            }
            else {
                this._GeneratePOGroupDialog.getModel().setProperty("/items", this._aCreatePOResult);
                this._GeneratePOGroupDialog.getModel().setProperty("/rowCount", this._aCreatePOResult.length);
            }

            this._GeneratePOGroupDialog.setTitle("PO Creation: Groups");
            this._GeneratePOGroupDialog.open();
        },

        onCreatePOGroupClose: function(oEvent) {
            this._GeneratePOGroupDialog.close();           
        },

        showGeneratePOResult() {
            // display pop-up for user selection
            this._aCreatePOResult = this._aCreatePOResult.sort((a,b) => (a.GROUP > b.GROUP ? 1 : -1));
            
            if (!this._GeneratePOResultDialog) {
                this._GeneratePOResultDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.GeneratePOResultDialog", this);

                this._GeneratePOResultDialog.setModel(
                    new JSONModel({
                        items: this._aCreatePOResult,
                        rowCount: this._aCreatePOResult.length < 7 ? 7 : this._aCreatePOResult.length
                    })
                )

                this.getView().addDependent(this._GeneratePOResultDialog);
            }
            else {
                this._GeneratePOResultDialog.getModel().setProperty("/items", this._aCreatePOResult);
                this._GeneratePOResultDialog.getModel().setProperty("/rowCount", this._aCreatePOResult.length);
            }

            this._GeneratePOResultDialog.setTitle("Generate PO Result");
            this._GeneratePOResultDialog.open();
        },

        onCreatePOResultClose: function(oEvent) {
            this._GeneratePOResultDialog.close();

            if (this._poCreated) this.getOwnerComponent().getModel("UI_MODEL").setProperty("/flag", true);

            var oHistory, sPreviousHash;
            
            if (sap.ui.core.routing.History !== undefined) {
                oHistory = sap.ui.core.routing.History.getInstance();
                sPreviousHash = oHistory.getPreviousHash();
            }

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else { 
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", {}, true /*no history*/);
            }

            this.setRowReadMode("detail");
            this.getOwnerComponent().getModel("UI_MODEL").setProperty("/columnUpdate", this._columnUpdated);
            this.getOwnerComponent().getModel("UI_MODEL").setProperty("/columns", this._aColumns);
        },

        showMessage: function(oMessage, iDuration) {
            MessageToast.show(oMessage, {
                duration: iDuration == undefined ? 2000 : iDuration,
                animationDuration: 500,
                at: 'center center',
                offset: '0 100'
            });
        },

        handlesuggestionItemSelected: function(oEvent) {
            oEvent.getSource().setDescription("test");    
        },

        onNewStyle: function (oEvent) {
            var me = this;
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "ZUI_3DERP",
                    action: "manage&/RouteStyleDetail/NEW/VER/1000117"
                }
                // params: {
                //     "styleno": "NEW",
                //     "sbu": me._sbu
                // }
            })) || ""; // generate the Hash to display style

            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            }); // navigate to Supplier application
        },

        getPOTolerance(arg1, arg2) {
            var me = this;
            var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
            var oHeaderData = this.getView().getModel("grpheader").getData();
            var oDetailData = arg2;            
            var sVendor = oHeaderData[0].VENDOR;

            if (!isNaN(sVendor)) {
                while (sVendor.length < 10) sVendor = "0" + sVendor;
            }

            var oParam = {
                IV_DOCTYPE: oHeaderData[0].DOCTYPE,
                IV_VENDOR: sVendor,
                IV_PRNUMBER: oDetailData.PRNUMBER,
                IV_PRITEM: oDetailData.PRITEMNO,
                IV_POQTY: oDetailData.ORDERPOQTY
            }

            oModel.create("/Get_POTolSet", oParam, {
                method: "POST",
                success: function(oData, oResponse) {
                    var sActiveGroup = me.getView().getModel("ui").getData().activeGroup;
                    var sRowPath = arg1;

                    if ((oData.RETURN + "") !== "4") {
                        me.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)
                            .forEach((item, idx) => {
                                if (idx.toString() === sRowPath.replace("/","")) { 
                                    item.OVERDELTOL = (+oData.EV_UEBTO).toFixed(1);
                                    item.UNDERDELTOL = (+oData.EV_UNTTO).toFixed(1);
                                    item.UNLI = oData.EV_UNLI === "" ? false : true;

                                    me.byId("detailTab").getModel("detail").setProperty(sRowPath + '/OVERDELTOL', oData.EV_UEBTO);
                                    me.byId("detailTab").getModel("detail").setProperty(sRowPath + '/UNDERDELTOL', oData.EV_UNTTO);
                                    me.byId("detailTab").getModel("detail").setProperty(sRowPath + '/UNLI', oData.EV_UNLI === "" ? false : true);
                                }
                            })

                        if (me._oParamCPOTolData.filter(fItem => fItem.EBELP === oDetailData.ITEM).length > 0) {
                            me._oParamCPOTolData.forEach((item, index) => {
                                if (item.EBELP === oDetailData.ITEM) {
                                    me._oParamCPOTolData[index].TOLALLOWEDIT = oData.EV_ALLOWEDIT;
                                    me._oParamCPOTolData[index].QTYMIN = oData.EV_QTYMIN;
                                    me._oParamCPOTolData[index].QTYMAX = oData.EV_QTYMAX;
                                    me._oParamCPOTolData[index].UNTTOMIN = oData.EV_UNTTOMIN;
                                    me._oParamCPOTolData[index].UNTTOMAX = oData.EV_UNTTOMAX;
                                    me._oParamCPOTolData[index].UEBTOMIN = oData.EV_UEBTOMIN;
                                    me._oParamCPOTolData[index].UEBTOMAX = oData.EV_UEBTOMAX;
                                }
                            })                            
                        }
                        else {
                            me._oParamCPOTolData.push({
                                EBELN: "",
                                EBELP: oDetailData.ITEM,
                                WEMNG: "0",
                                FOCQTY: "0",
                                TOLALLOWEDIT: oData.EV_ALLOWEDIT,
                                QTYMIN: oData.EV_QTYMIN,
                                QTYMAX: oData.EV_QTYMAX,
                                UNTTOMIN: oData.EV_UNTTOMIN,
                                UNTTOMAX: oData.EV_UNTTOMAX,
                                UEBTOMIN: oData.EV_UEBTOMIN,
                                UEBTOMAX: oData.EV_UEBTOMAX,
                            })
                        }
                    }
                    else {
                        if (me._oParamCPOTolData.filter(fItem => fItem.EBELP === oDetailData.ITEM).length > 0) {
                            me._oParamCPOTolData.forEach((item, index) => {
                                if (item.EBELP === oDetailData.ITEM) {
                                    me._oParamCPOTolData.splice(index, 1);

                                    //put back original data
                                    me.getView().getModel("detail").getData().filter(fItem => fItem.GROUP === sActiveGroup)
                                        .forEach((item, idx) => {
                                            if (idx.toString() === sRowPath.replace("/","")) {
                                                var oOrigDtlData = me.getOwnerComponent().getModel("CREATEPO_MODEL").getData().detail.filter(fItem => fItem.GROUP === sActiveGroup);
                                                // console.log(oOrigDtlData)
                                                item.OVERDELTOL = oOrigDtlData[0].OVERDELTOL;
                                                item.UNDERDELTOL = oOrigDtlData[0].UNDERDELTOL;
                                                item.UNLI = oOrigDtlData[0].UNLI;

                                                me.byId("detailTab").getModel("detail").setProperty(sRowPath + '/OVERDELTOL', oOrigDtlData[0].OVERDELTOL);
                                                me.byId("detailTab").getModel("detail").setProperty(sRowPath + '/UNDERDELTOL', oOrigDtlData[0].UNDERDELTOL);
                                                me.byId("detailTab").getModel("detail").setProperty(sRowPath + '/UNLI', oOrigDtlData[0].UNLI);
                                            }
                                        })
                                }
                            })
                        }
                    }
                },
                error: function (err) { }
            })
        },

        savePOTolerance(arg) {
            this._oModel.setUseBatch(true);
            this._oModel.setDeferredGroups(["update"]);

            var sPONo = arg;
            var mParameters = { groupId:"update" }

            this._oParamCPOTolData.forEach(item => item.EBELN = sPONo);

            this.getView().getModel("detail").getData().forEach(item => {
                if (this._oParamCPOTolData.filter(fItem => fItem.EBELP === item.ITEM).length === 0) {
                    this._oParamCPOTolData.push({
                        EBELN: sPONo,
                        EBELP: item.ITEM,
                        WEMNG: this._oDataPOTolerance.WEMNG,
                        FOCQTY: this._oDataPOTolerance.FOCQTY,
                        TOLALLOWEDIT: this._oDataPOTolerance.TOLALLOWEDIT,
                        QTYMIN: this._oDataPOTolerance.QTYMIN,
                        QTYMAX: this._oDataPOTolerance.QTYMAX,
                        UNTTOMIN: this._oDataPOTolerance.UNTTOMIN,
                        UNTTOMAX: this._oDataPOTolerance.UNTTOMAX,
                        UEBTOMIN: this._oDataPOTolerance.UEBTOMIN,
                        UEBTOMAX: this._oDataPOTolerance.UEBTOMAX,
                    })                    
                }
            })

            this._oParamCPOTolData.forEach(tol => {
                this._oModel.create("/PODataSet", tol, mParameters);
            })

            this._oModel.submitChanges({
                groupId: "update",
                success: function (oData, oResponse) { },
                error: function () { }
            }) 
        },

        formatValueHelp: function(sValue, sPath, sKey, sText, sFormat) {
            var oValue = this.getView().getModel(sPath).getData().filter(v => v[sKey] === sValue);
            // console.log(sValue, sPath, sKey, sText, sFormat)
            if (oValue && oValue.length > 0) {
                if (sFormat === "Value") {
                    return oValue[0][sText];
                }
                else if (sFormat === "ValueKey") {
                    return oValue[0][sText] + " (" + sValue + ")";
                }
                else if (sFormat === "KeyValue") {
                    return sValue + " (" + oValue[0][sText] + ")";
                }
                else {
                    return sValue;
                }
            }
            else return sValue;
        },

        onCreatePOGroupCellClick: function (oEvent) {
            var vGroup = oEvent.getParameters().rowBindingContext.getObject().GROUP;
            var vCurrGrp = this.getView().getModel("ui").getData().activeGroup;
            var oHeaderData = this.getView().getModel("header").getData();
            var aGrpHeaderData = oHeaderData.filter(grp => grp.GROUP === vGroup);
            var vStatus = aGrpHeaderData[0].STATUS;
            var vMax = oHeaderData.length + "";
            var vMin = "0";

            oHeaderData.forEach(item => {
                if (item.STATUS === "NEW") {
                    if (vMin === "0") { vMin = item.GROUP; }
                    vMax = item.GROUP;
                }                
            })

            if ((vGroup !== vCurrGrp && vStatus !== "CREATED") || (vGroup === vCurrGrp && (vStatus === "CANCELLED" || vStatus === "ERROR"))) {
                this.onLoadGroup(vGroup);

                if (vMin === "0") {
                    this.byId("btnPrevPO").setEnabled(false); 
                    this.byId("btnNextPO").setEnabled(false);
                }
                else if (vMin === vGroup || vGroup === "1") { 
                    this.byId("btnPrevPO").setEnabled(false); 

                    if (vMax === vGroup || vGroup === oHeaderData.length + "") { this.byId("btnNextPO").setEnabled(false); }
                    else { this.byId("btnNextPO").setEnabled(true); }
                }
                else if (vMax === vGroup || vGroup === oHeaderData.length + "") { 
                    this.byId("btnNextPO").setEnabled(false); 

                    if (vMin === vGroup || vGroup === "1") { this.byId("btnPrevPO").setEnabled(false); }
                    else { this.byId("btnPrevPO").setEnabled(true); }
                }
            }
        },

        handleFormValueHelp: function (oEvent) {
            TableValueHelp.handleFormValueHelp(oEvent, this);
        },

        onFormValueHelpInputChange: function(oEvent) {
            var oSource = oEvent.getSource();
            var isInvalid = !oSource.getSelectedKey() && oSource.getValue().trim();
            oSource.setValueState(isInvalid ? "Error" : "None");

            // oSource.getSuggestionItems().forEach(item => {
            //     if (item.getProperty("key") === oSource.getValue().trim()) {
            //         isInvalid = false;
            //         oSource.setValueState(isInvalid ? "Error" : "None");
            //     }
            // })

            if (isInvalid) {
                this.validateInputValue(oSource);
            }
            else {
                var sModel = oSource.getBindingInfo("value").parts[0].model;
                var sPath = oSource.getBindingInfo("value").parts[0].path;

                this.getView().getModel(sModel).setProperty(sPath, oSource.getSelectedKey());

                this._validationErrors.forEach((item, index) => {
                    if (item === oEvent.getSource().getId()) {
                        this._validationErrors.splice(index, 1)
                    }
                })
            }

            this._bHeaderChanged = true;
        },

        onTableClick(oEvent) {
            var oControl = oEvent.srcControl;
            var sTabId = oControl.sId.split("--")[oControl.sId.split("--").length - 1];

            while (sTabId.substr(sTabId.length - 3) !== "Tab") {                    
                oControl = oControl.oParent;
                sTabId = oControl.sId.split("--")[oControl.sId.split("--").length - 1];
            }
            
            this._sActiveTable = sTabId;
        },

        onKeyDown(oEvent) {           
            if (this._headerTextDialog) {
                if (oEvent.key.toUpperCase() === "ENTER") {
                    if (oEvent.srcControl.sParentAggregationName === "cells" && (this._sActiveTable === "remarksTab" || this._sActiveTable === "packinsTab")) { this.onAddHdrTxt(); }
                }
                else if (oEvent.ctrlKey && oEvent.key.toUpperCase() === "I") {
                    this.onAddHdrTxt();
                }
                else if (oEvent.ctrlKey && oEvent.key.toUpperCase() === "S") {
                    this.onSaveHdrTxt();
                }
                else if (oEvent.ctrlKey && oEvent.key.toUpperCase() === "D") {
                    oEvent.preventDefault();
                    this.onDeleteHdrTxt();
                }
                else if (oEvent.ctrlKey && oEvent.key.toUpperCase() === "X") {
                    this.onCloseHdrTxt();
                }
            }
            else if (this._changeDateDialog) {
                if (oEvent.key.toUpperCase() === "ENTER") {
                    this.onChangeDate();
                }
                else if (oEvent.ctrlKey && oEvent.key.toUpperCase() === "X") {
                    this.onCloseChangeDate();
                }
            }
        },
        
        onInputKeyDown(oEvent) {
            if (oEvent.key === "ArrowUp" || oEvent.key === "ArrowDown") {
                //prevent increase/decrease of number value
                oEvent.preventDefault();

                if (this._inputSuggest) { return }

                var sTableId = oEvent.srcControl.oParent.oParent.sId;
                // var oTable = this.byId(sTableId);
                var oTable = sap.ui.getCore().byId(sTableId);
                var sColumnName = oEvent.srcControl.getBindingInfo("value").parts[0].path;
                var sCurrentRowIndex = -1;
                var sColumnIndex = -1;
                var sCurrentRow = -1;
                var sNextRow = -1;
                var sActiveRow = -1;
                var iFirstVisibleRowIndex = oTable.getFirstVisibleRow();
                var iVisibleRowCount = oTable.getVisibleRowCount();
                var iRowCount = 0;

                if (this._headerTextDialog) {
                    var activeTab = sap.ui.getCore().byId("ITB1").getSelectedKey();

                    if (activeTab === "remarks") {
                        iRowCount = this._oHeaderTextDialog.getModel().getData().rem_items.length;
                        sCurrentRowIndex = +oEvent.srcControl.oParent.getBindingContext().sPath.replace("/rem_items/", "");
                        this._oHeaderTextDialog.getModel().setProperty(oEvent.srcControl.oParent.getBindingContext().sPath + "/REMARKS", oEvent.srcControl.getValue());
                    }
                    else if (activeTab === "packins") {
                        iRowCount = this._oHeaderTextDialog.getModel().getData().packins_items.length;
                        sCurrentRowIndex = +oEvent.srcControl.oParent.getBindingContext().sPath.replace("/packins_items/", "");
                        this._oHeaderTextDialog.getModel().setProperty(oEvent.srcControl.oParent.getBindingContext().sPath + "/PACKINS", oEvent.srcControl.getValue());
                    }
                }
                else {
                    iRowCount = oTable.getModel("detail").getData().length;
                    sCurrentRowIndex = +oEvent.srcControl.oParent.getBindingContext("detail").sPath.replace("/", "");
                    oTable.getModel("detail").setProperty(oEvent.srcControl.oParent.getBindingContext("detail").sPath + "/" + oEvent.srcControl.getBindingInfo("value").parts[0].path, oEvent.srcControl.getValue());
                }

                //get active row (arrow down)
                oTable.getBinding("rows").aIndices.forEach((item, index) => {
                    if (item === sCurrentRowIndex) { sCurrentRow = index; }
                    if (sCurrentRow !== -1 && sActiveRow === -1) { 
                        if ((sCurrentRow + 1) === index) { sActiveRow = item }
                        else if ((index + 1) === oTable.getBinding("rows").aIndices.length) { sActiveRow = item }
                    }
                })
                
                //get next row to focus and active row (arrow up)
                if (oEvent.key === "ArrowUp") { 
                    if (sCurrentRow !== 0) {
                        sActiveRow = oTable.getBinding("rows").aIndices.filter((fItem, fIndex) => fIndex === (sCurrentRow - 1))[0];
                    }
                    else { sActiveRow = oTable.getBinding("rows").aIndices[0] }

                    sCurrentRow = sCurrentRow === 0 ? sCurrentRow : sCurrentRow - iFirstVisibleRowIndex;
                    sNextRow = sCurrentRow === 0 ? 0 : sCurrentRow - 1;
                }
                else if (oEvent.key === "ArrowDown") { 
                    sCurrentRow = sCurrentRow - iFirstVisibleRowIndex;
                    sNextRow = sCurrentRow + 1;
                }

                //auto-scroll up/down
                if (oEvent.key === "ArrowDown" && (sNextRow + 1) < iRowCount && (sNextRow + 1) > iVisibleRowCount) {
                    oTable.setFirstVisibleRow(iFirstVisibleRowIndex + 1);
                }   
                else if (oEvent.key === "ArrowUp" && sCurrentRow === 0 && sNextRow === 0 && iFirstVisibleRowIndex !== 0) { 
                    oTable.setFirstVisibleRow(iFirstVisibleRowIndex - 1);
                }

                //get the cell to focus
                oTable.getRows()[sCurrentRow].getCells().forEach((cell, index) => {
                    if (cell.getBindingInfo("value") !== undefined) {
                        if (cell.getBindingInfo("value").parts[0].path === sColumnName) { sColumnIndex = index; }
                    }
                })
                
                if (oEvent.key === "ArrowDown") {
                    sNextRow = sNextRow === iVisibleRowCount ? sNextRow - 1 : sNextRow;
                }

                //set focus on cell
                setTimeout(() => {
                    oTable.getRows()[sNextRow].getCells()[sColumnIndex].focus();
                    oTable.getRows()[sNextRow].getCells()[sColumnIndex].getFocusDomRef().select();
                }, 100);
            }
        },

        onPOLock: async function(){
            var me = this;
            var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK2_SRV");
            var sError = "";
            var boolResult = true;

            var oParam = {
                "N_LOCK_PO_ITEMTAB": this._aParamLockPOdata,
                "iv_count": 300, 
                "N_LOCK_PO_ENQ": [], 
                "N_LOCK_PO_OUTMESSAGES": [] 
            }

            await new Promise((resolve, reject) => {
                oModel.create("/Lock_POHdr_Set", oParam, {
                    method: "POST",
                    success: function(data, oResponse) {
                        for(var item of data.N_LOCK_PO_OUTMESSAGES.results) {
                            if (item.Type === "E") {
                                sError += item.Message + ". ";
                            }
                        }

                        if (sError.length > 0) {
                            boolResult = false;
                            MessageBox.information(sError);
                            me.closeLoadingDialog();
                        }

                        resolve();
                    },
                    error: function(err) {
                        MessageBox.error(me.getView().getModel("ddtext").getData()["INFO_ERROR"] + " " + error.message);
                        boolResult = false;
                        resolve();
                        me.onPOUnlock();
                        me.closeLoadingDialog();
                    }
                });
                
            });

            return boolResult;
        },

        onPOUnlock: function(){
            var me = this;
            var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK2_SRV");

            var oParam = {
                "N_UNLOCK_PO_ITEMTAB": this._aParamLockPOdata,
                "N_UNLOCK_PO_ENQ": [], 
                "N_UNLOCK_PO_MESSAGES": [] 
            };
            console.log("unlocking PO: ", oParam);
            oModel.create("/Unlock_POHdr_Set", oParam, {
                method: "POST",
                success: function(oData, oResponse) {
                    me._aParamLockPOdata = [];
                    console.log(oData)
                    console.log(oResponse)
                },
                error: function(err) { }
            });
        },

        suggestionRowValidator: function (oColumnListItem) {
            var aCells = oColumnListItem.getCells();
            
            if (aCells.length === 1) {
                return new sap.ui.core.Item({
                    key: aCells[0].getText(),
                    text: aCells[0].getText()
                }); 
            }
            else {
                return new sap.ui.core.Item({
                    key: aCells[0].getText(),
                    text: aCells[1].getText()
                });
            }
        },

        onSaveTableLayout: function () {
            //saving of the layout of table
            var me = this;
            var ctr = 1;
            var oTable = this.getView().byId("detailTab");
            var oColumns = oTable.getColumns();
            var vSBU = this.getOwnerComponent().getModel("UI_MODEL").getData().sbu;

            var oParam = {
                "SBU": vSBU,
                "TYPE": "ANPCRTPO",
                "TABNAME": "Z3DERP_ANPCRTPO",
                "TableLayoutToItems": []
            };
            
            //get information of columns, add to payload
            oColumns.forEach((column) => {
                oParam.TableLayoutToItems.push({
                    COLUMNNAME: column.mProperties.name,
                    ORDER: ctr.toString(),
                    SORTED: column.mProperties.sorted,
                    SORTORDER: column.mProperties.sortOrder,
                    SORTSEQ: "1",
                    VISIBLE: column.mProperties.visible,
                    WIDTH: column.mProperties.width.replace('px',''),
                    WRAPTEXT: this.getOwnerComponent().getModel("UI_MODEL").getData().dataWrap["detailTab"] === true ? "X" : ""
                });

                ctr++;
            });

            //call the layout save
            var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");

            oModel.create("/TableLayoutSet", oParam, {
                method: "POST",
                success: function(data, oResponse) {
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_LAYOUT_SAVE"]);
                    //Common.showMessage(me._i18n.getText('t6'));
                },
                error: function(err) {
                    sap.m.MessageBox.error(err);
                }
            });
        },

        onWrapText: function(oEvent) {
            this._sActiveTable = oEvent.getSource().data("TableId");

            var vWrap = this.getOwnerComponent().getModel("UI_MODEL").getData().dataWrap[this._sActiveTable];
            
            this.byId(this._sActiveTable).getColumns().forEach(col => {
                var oTemplate = col.getTemplate();
                
                if (col.getTemplate() instanceof sap.m.Text) {
                    oTemplate.setWrapping(!vWrap);
                    col.setTemplate(oTemplate);
                }
            })

            this.getOwnerComponent().getModel("UI_MODEL").setProperty("/dataWrap/" + [this._sActiveTable], !vWrap);
            this.getView().getModel("ui").setProperty("/dataWrap/" + [this._sActiveTable], !vWrap);
        },

        columnTemplate: function (sColumnId, sColumnType, sTextWrapping) {
            var oColumnTemplate;

            if (sColumnType === "BOOLEAN") {
                oColumnTemplate = new sap.m.CheckBox({ selected: "{detail>" + sColumnId + "}", editable: false });
            }
            else if (sColumnType === "NUMBER") {
                oColumnTemplate = new sap.m.Text({ 
                    text: "{detail>" + sColumnId + "}", 
                    wrapping: sTextWrapping === "X" ? true : false
                }); 
            }
            else {
                oColumnTemplate = new sap.m.Text({ 
                    text: "{detail>" + sColumnId + "}", 
                    wrapping: sTextWrapping === "X" ? true : false,
                    tooltip: "{detail>" + sColumnId + "}"
                }); 
            }

            return oColumnTemplate;
        },

        onInputSuggest: function(oEvent) {
            //override the default filtering "StartsWidth" to "Contains"
            var oInputSource = oEvent.getSource();
            var sSuggestValue = oEvent.getParameter("suggestValue").toLowerCase();
            var aFilters = [];
            var oFilter = null;
            // console.log(oInputSource)
            this._inputSuggest = true;

            if (oInputSource.getSuggestionRows().length === 0){
                oInputSource.getBinding("suggestionRows").filter(null);
            }
            
            if (oInputSource.getSuggestionRows().length > 0) {
                oInputSource.getSuggestionRows()[0].getCells().forEach(cell => {
                    aFilters.push(new Filter(cell.getBinding("text").sPath, FilterOperator.Contains, sSuggestValue))
                })

                oFilter = new Filter(aFilters, false);

                oInputSource.getBinding("suggestionRows").filter(oFilter);
                oInputSource.setShowSuggestion(true);
                oInputSource.setFilterSuggests(false);
            }
        },

        onInputSuggestionItemSelected: function(oEvent) {
            this._inputSuggest = false;
        },

        validateInputValue(source) {
            var oInputSource = source;                
            var sValue = oInputSource.getProperty("value").toLowerCase();
            var sDataSourceModel = oInputSource.getBindingInfo("value").parts[1].value;
            var sKey = oInputSource.getBindingInfo("value").parts[2].value;
            var sText = oInputSource.getBindingInfo("value").parts[3].value;
            var sTextFormatMode = oInputSource.getProperty("textFormatMode");
            var aDataSource = jQuery.extend(true, [], this.getView().getModel(sDataSourceModel).getData());

            aDataSource.forEach(item => {
                if (sTextFormatMode === "ValueKey") {
                    item.DESCCODE = item[sText] + " (" + item[sKey] + ")";
                }
                else if (sTextFormatMode === "KeyValue") {
                    item.CODEDESC = item[sKey] + " (" + item[sText] + ")";
                }
            })

            var aCols = Object.keys(aDataSource[0]).filter(fItem => fItem !== "__metadata");
            var vColCount = aCols.length;

            // var matchedData = aDataSource.filter(function (d) {
            //     for (let i = 0; i < vColCount; i++) {
            //         // check for a match
            //         if (d[aCols[i]] != null) {
            //             if (d[aCols[i]].toString().toLowerCase().indexOf(sValue) !== -1 || !sValue) {
            //                 // found match, return true to add to result set
            //                 return true;
            //             }
            //         }
            //     }
            // });

            var matchedData = aDataSource.filter(function (d) {
                for (let i = 0; i < vColCount; i++) {
                    // check for a match
                    if (d[aCols[i]] != null) {
                        if (d[aCols[i]].toString().toLowerCase() === sValue) {
                            // found match, return true to add to result set
                            return true;
                        }
                    }
                }
            });

            if (matchedData.length !== 0) {
                // console.log(matchedData[0][sKey])                    
                
                if (sTextFormatMode === "ValueKey") {
                    oInputSource.setValue(matchedData[0][sText] + " (" + matchedData[0][sKey] + ")")
                }
                else if (sTextFormatMode === "KeyValue") {
                    oInputSource.setValue(matchedData[0][sKey] + " (" + matchedData[0][sText] + ")")
                }
                else if (sTextFormatMode === "Key") {
                    oInputSource.setValue(matchedData[0][sKey])
                }
                else if (sTextFormatMode === "Value") {
                    oInputSource.setValue(matchedData[0][sText])
                }

                oInputSource.setSelectedKey(matchedData[0][sKey]);
                oInputSource.setValueState("None");

                this.setValuesAfterInputChange(oInputSource);

                // if (sModel === "grpheader") {
                //     this.getView().getModel(sModel).setProperty(sFieldName, matchedData[0][sKey]);
                // }
                // else {
                //     this.byId(this._sActiveTable).getModel().setProperty(sRowPath + '/' + sFieldName, matchedData[0][sKey]);
                // }

                // this._validationErrors.forEach((item, index) => {
                //     if (item === oEvent.getSource().getId()) {
                //         this._validationErrors.splice(index, 1)
                //     }
                // })
            }
            else {
                oInputSource.setValueState("Error");
                this._validationErrors.push(oEvent.getSource().getId()); 
            }
        },

        setValuesAfterInputChange(source) {
            var oSource = source;
            var sModel = oSource.getBindingInfo("value").parts[0].model;
            var sPath = oSource.getBindingInfo("value").parts[0].path;
            var vValue = oSource.getSelectedKey();

            if (sModel === "grpheader") {
                this.getView().getModel(sModel).setProperty(sPath, vValue);
            }
            else {
                var oTable = this.byId(sModel + "Tab");
                var sRowPath = oSource.oParent.getBindingContext(sModel).sPath;
                
                if (sPath === "SUPPLYTYPE") {
                    var iRowIndex = +sRowPath.split("/")[sRowPath.split("/").length-1];
                        
                    if (vValue === "") {
                        var vInfoRecCheck = this.getView().getModel(sModel).getProperty(sRowPath + '/INFORECCHECK');
                        if (vInfoRecCheck) { oTable.getRows()[iRowIndex].getCells()[this._iGPCellIndex].setProperty("enabled", false); }
                        else { oTable.getRows()[iRowIndex].getCells()[this._iGPCellIndex].setProperty("enabled", true); }
                    }
                    else {
                        var oSupplyType = this.getView().getModel("supplyType").getData().filter(fItem => fItem.SUPPLYTYP === vValue);

                        if (oSupplyType[0].FOC === "X") {
                            //disable gross/net price, set value to zero                    
                            oTable.getRows()[iRowIndex].getCells()[this._iGPCellIndex].setProperty("enabled", false);
        
                            this.getView().getModel(sModel).setProperty(sRowPath + '/GROSSPRICE', "0");
                            oTable.getModel(sModel).setProperty(sRowPath + '/GROSSPRICE', "0");
                        }
                        else {
                            var vInfoRecCheck = this.getView().getModel(sModel).getProperty(sRowPath + '/INFORECCHECK');
                            if (vInfoRecCheck) { oTable.getRows()[iRowIndex].getCells()[this._iGPCellIndex].setProperty("enabled", false); }
                            else { oTable.getRows()[iRowIndex].getCells()[this._iGPCellIndex].setProperty("enabled", true); }
                        }
                    }
                }
                else if (oSource.getBindingInfo("value").parts[0].path === "ORDUOM") {
                    if (vValue !== "") {
                        var oUOM = this.getView().getModel("uom").getData().filter(fItem => fItem.MSEHI === vValue);
                        var vOrderUOMANDEC = this.getView().getModel(sModel).getProperty(sRowPath + '/ORDERUOMANDEC');
        
                        if (vOrderUOMANDEC !== oUOM[0].ANDEC) {
                            var vBasePOQty = this.getView().getModel(sModel).getProperty(sRowPath + '/BASEPOQTY');
                            var vBaseConvFactor = this.getView().getModel(sModel).getProperty(sRowPath + '/BASECONVFACTOR');
                            var vOrderConvFactor = this.getView().getModel(sModel).getProperty(sRowPath + '/ORDERCONVFACTOR');
                            var vPer = this.getView().getModel(sModel).getProperty(sRowPath + '/PER');
        
                            var sOrderConvFactor = vOrderConvFactor === "" || vOrderConvFactor === "0" ? "1" : vOrderConvFactor;
                            var sBaseConvFactor = vBaseConvFactor === "" || vBaseConvFactor === "0" ? "1" : vBaseConvFactor;
                            var sPer = vPer === "" ? "1" : vPer;
                            var vComputedPOQty = +vBasePOQty / ((+sOrderConvFactor) * (+sBaseConvFactor) * (+sPer));
                            var vFinalPOQty = "0";
        
                            if (oUOM[0].ANDEC === 0) vFinalPOQty = Math.ceil(vComputedPOQty).toString();
                            else vFinalPOQty = vComputedPOQty.toFixed(oUOM[0].ANDEC);
        
                            this.getView().getModel(sModel).setProperty(sRowPath + '/ORDERUOMANDEC', oUOM[0].ANDEC);
                            this.getView().getModel(sModel).setProperty(sRowPath + '/ORDERPOQTY', vFinalPOQty);
                        }
                    }
                }

                this.getView().getModel(sModel).setProperty(sRowPath + '/' + sPath, vValue);

                if (oSource.getSelectedKey() === "") { oSource.setSelectedKey(vValue); }
            }

            this._validationErrors.forEach((item, index) => {
                if (item === oEvent.getSource().getId()) {
                    this._validationErrors.splice(index, 1)
                }
            })
        },

        onColumnUpdated: function(oEvent) {
            console.log(oEvent);
            this._columnUpdated = true;
        }

    })
})