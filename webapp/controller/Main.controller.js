sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "../js/Common",
        "sap/m/Token",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        'sap/m/SearchField',
        'sap/ui/model/type/String',
        'sap/m/ColumnListItem',
        'sap/m/Label',
        "../js/TableFilter",
        "../js/TableValueHelp",
        "../js/SmartFilterCustomControl"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Common, Token, Filter, FilterOperator, SearchField, typeString, ColumnListItem, Label, TableFilter, TableValueHelp, SmartFilterCustomControl) {
        "use strict";

        var that;
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "MM/dd/yyyy" });
        var sapDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });

        return Controller.extend("zuiaprocess.controller.Main", {

            onInit: function () {
                that = this;
                var me = this;
                this._oModel = this.getOwnerComponent().getModel();
                this._tableFilter = TableFilter;
                this._tableValueHelp = TableValueHelp;
                this._smartFilterCustomControl = SmartFilterCustomControl;
                this._oModelColumns = [];
                this._aColumns = [];
                this._colFilters = {};
                this._selectedRecs = [];
                this._sActiveTable = "mainTab";
                this.validationErrors = [];

                var oInterval = setInterval(() => {
                    if (sap.ui.getCore().byId("backBtn") !== undefined) {
                        if (sap.ui.getCore().byId("backBtn") !== undefined) {
                            this._fBackButton = sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction;
                            
                            var oView = this.getView();
                            oView.addEventDelegate({
                                onAfterShow: function(oEvent){
                                    sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = that._fBackButton; 
                                    
                                    if (that.getOwnerComponent().getModel("UI_MODEL").getData().flag) {
                                        that.refreshTableData();
                                    }
                                    
                                    if (that._oLock.length > 0) {
                                        that.unLock();
                                    }
                                }
                            }, oView);
                        }

                        clearInterval(oInterval);
                    }
                }, 1000);

                this.showLoadingDialog('Loading...');

                this._counts = {
                    total: 0,
                    unassigned: 0,
                    partial: 0
                }

                this.getView().setModel(new JSONModel({
                    sbu: '',
                    currsbu: '',
                    dataWrap: {
                        mainTab: false
                    }
                }), "ui");

                this._sbuChange = false;
                var oJSONDataModel = new JSONModel(); 
                oJSONDataModel.setData(this._counts);

                this.getView().setModel(oJSONDataModel, "counts");

                // this.setSmartFilterModel();
                SmartFilterCustomControl.setSmartFilterModel(this);
                this._oAssignVendorData = [];
                this._oCreateData = [];
                this._oLock = [];

                var oModel = this.getOwnerComponent().getModel("ZVB_3DERP_ANP_FILTERS_CDS");
                oModel.read("/ZVB_3DERP_SBU_SH", {
                    success: function (oData, oResponse) {
                        if (oData.results.length === 1) {
                            that.getView().getModel("ui").setProperty("/sbu", oData.results[0].SBU);
                            // that.getColumns("AUTO_INIT");
                        }
                        else {
                            that.closeLoadingDialog();
                            that.byId("searchFieldMain").setEnabled(false);
                            that.byId("btnAssign").setEnabled(false);                            
                            that.byId("btnUnassign").setEnabled(false);
                            that.byId("btnCreatePO").setEnabled(false);
                            that.byId("btnTabLayout").setEnabled(false);
                            that.byId("btnManualAssign").setEnabled(false);
                            that.byId("btnUpdPurPlant").setEnabled(false);
                            that.byId("btnCreateInfoRec").setEnabled(false);
                            that.byId("btnDataWrap").setEnabled(false);
                        }
                    },
                    error: function (err) { }
                });

                var oJSONModel = new JSONModel();
                var oDDTextParam = [], oDDTextResult = {};
                oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");

                oDDTextParam.push({CODE: "SBU"});
                oDDTextParam.push({CODE: "DOCTYPE"});
                oDDTextParam.push({CODE: "PRNUMBER"});
                oDDTextParam.push({CODE: "SHIPTOPLANT"});
                oDDTextParam.push({CODE: "PURCHPLANT"});
                oDDTextParam.push({CODE: "PURCHGRP"});
                oDDTextParam.push({CODE: "VENDOR"});
                oDDTextParam.push({CODE: "MATERIALGRP"});
                oDDTextParam.push({CODE: "MATERIALTYPE"});
                oDDTextParam.push({CODE: "IONUMBER"});
                oDDTextParam.push({CODE: "SEASON"});
                oDDTextParam.push({CODE: "ASSIGNVENDOR"});
                oDDTextParam.push({CODE: "UNDOASSIGNVENDOR"});
                oDDTextParam.push({CODE: "UNASSIGNED"});
                oDDTextParam.push({CODE: "PARTIAL"});
                oDDTextParam.push({CODE: "TOTAL"});
                oDDTextParam.push({CODE: "CREATEPO"});
                oDDTextParam.push({CODE: "SAVELAYOUT"});
                oDDTextParam.push({CODE: "GROUP"});
                oDDTextParam.push({CODE: "PODATE"});
                oDDTextParam.push({CODE: "VENDORNAME"});
                oDDTextParam.push({CODE: "PURCHORG"});
                oDDTextParam.push({CODE: "COMPANY"});
                oDDTextParam.push({CODE: "PAYTERMS"});
                oDDTextParam.push({CODE: "INCOTERMS"});
                oDDTextParam.push({CODE: "DESTINATION"});
                oDDTextParam.push({CODE: "CURR"});
                oDDTextParam.push({CODE: "EXRATE"});
                oDDTextParam.push({CODE: "SHIPMODE"});
                oDDTextParam.push({CODE: "CREATEDBY"});
                oDDTextParam.push({CODE: "CREATEDDATE"});
                oDDTextParam.push({CODE: "EDIT"});
                oDDTextParam.push({CODE: "CHANGEDELVDATE"});
                oDDTextParam.push({CODE: "FABSPECS"});
                oDDTextParam.push({CODE: "HEADERTEXT"});
                oDDTextParam.push({CODE: "GENERATEPO"});
                oDDTextParam.push({CODE: "SAVE"});
                oDDTextParam.push({CODE: "CANCEL"});               
                oDDTextParam.push({CODE: "MATERIALNO"});
                oDDTextParam.push({CODE: "GMCDESCEN"});
                oDDTextParam.push({CODE: "ADDTLDESC"});
                oDDTextParam.push({CODE: "DELVDATE"});
                oDDTextParam.push({CODE: "BASEPOQTY"});
                oDDTextParam.push({CODE: "ORDERPOQTY"});
                oDDTextParam.push({CODE: "UOM"});
                oDDTextParam.push({CODE: "GROSSPRICE"});
                oDDTextParam.push({CODE: "NETPRICE"});
                oDDTextParam.push({CODE: "PER"});
                oDDTextParam.push({CODE: "ORDERPRICEUNIT"});
                oDDTextParam.push({CODE: "OVERDELTOL"});
                oDDTextParam.push({CODE: "UNDERDELTOL"});
                oDDTextParam.push({CODE: "UNLI"});
                oDDTextParam.push({CODE: "TAXCODE"});
                oDDTextParam.push({CODE: "GRBASEDIV"});
                oDDTextParam.push({CODE: "CANGRBASEDIVCEL"});
                oDDTextParam.push({CODE: "PRITEMNO"});
                oDDTextParam.push({CODE: "SUPPLYTYPE"});
                oDDTextParam.push({CODE: "ORDERCONVFACTOR"});
                oDDTextParam.push({CODE: "BASECONVFACTOR"});
                oDDTextParam.push({CODE: "BASEUOM"});
                oDDTextParam.push({CODE: "ADD"});
                oDDTextParam.push({CODE: "INFO_NO_RECORD_TO_PROC"});
                oDDTextParam.push({CODE: "INFO_NO_SEL_RECORD_TO_PROC"});
                oDDTextParam.push({CODE: "INFO_SEL1_PR_ONLY"});
                oDDTextParam.push({CODE: "INFO_NO_VENDOR"});
                oDDTextParam.push({CODE: "INFO_NO_LAYOUT"});
                oDDTextParam.push({CODE: "INFO_LAYOUT_SAVE"});
                oDDTextParam.push({CODE: "INFO_CREATEPO_VALIDATION"});
                oDDTextParam.push({CODE: "INFO_INPUT_REQD_FIELDS"});
                oDDTextParam.push({CODE: "CONF_CANCEL_CREATEPO"});
                oDDTextParam.push({CODE: "CONF_DISCARD_CHANGE"});
                oDDTextParam.push({CODE: "INFO_INVALID_SEL_MATTYP"});  
                oDDTextParam.push({CODE: "INFO_FABSPECS_SAVED"});  
                oDDTextParam.push({CODE: "INFO_INPUT_REMARKS"});  
                oDDTextParam.push({CODE: "INFO_REMARKS_SAVED"});  
                oDDTextParam.push({CODE: "INFO_INPUT_PACKINS"});  
                oDDTextParam.push({CODE: "INFO_PACKINS_SAVED"});  
                oDDTextParam.push({CODE: "INFO_CHECK_INVALID_ENTRIES"});  
                oDDTextParam.push({CODE: "INFO_SEL_RECORD_TO_DELETE"});  
                oDDTextParam.push({CODE: "INFO_DATA_DELETED"});  
                oDDTextParam.push({CODE: "INFO_CREATEPO_CHECK_REQD"});  
                oDDTextParam.push({CODE: "CONF_DELETE_RECORDS"});  
                oDDTextParam.push({CODE: "YES"});
                oDDTextParam.push({CODE: "BACK"});  
                oDDTextParam.push({CODE: "INFO_DELVDATE_UPDATED"});
                oDDTextParam.push({CODE: "INFO_NEXT_DELVDATE"});
                oDDTextParam.push({CODE: "CONTINUE"});
                oDDTextParam.push({CODE: "GENPOCANCEL"});
                oDDTextParam.push({CODE: "INFO_ERROR"});
                oDDTextParam.push({CODE: "INFO_NO_DATA_SAVE"});
                oDDTextParam.push({CODE: "ASSIGN"});
                oDDTextParam.push({CODE: "MANUALASSIGNVENDOR"});
                oDDTextParam.push({CODE: "INCO1"});
                oDDTextParam.push({CODE: "INCO2"});
                oDDTextParam.push({CODE: "CONFIRM_CANCEL_ASSIGNVENDOR"});
                oDDTextParam.push({CODE: "INFO_INVALID_SEL_MANUALASSIGNVENDOR"});
                oDDTextParam.push({CODE: "CLOSE"});
                oDDTextParam.push({CODE: "POCREATE"});
                oDDTextParam.push({CODE: "INFO_VENDOR_ALREADY_ASSIGNED"});
                oDDTextParam.push({CODE: "CANCELALL"});
                oDDTextParam.push({CODE: "ORDUOM"});
                oDDTextParam.push({CODE: "CONFIRM_SAVE_CHANGE"});
                oDDTextParam.push({CODE: "POADDTLDESC"});
                oDDTextParam.push({CODE: "PREVIOUS"});
                oDDTextParam.push({CODE: "NEXT"});
                oDDTextParam.push({CODE: "ZTERM"});
                oDDTextParam.push({CODE: "PURGRP"});
                oDDTextParam.push({CODE: "INFORECORD"});
                oDDTextParam.push({CODE: "PRICE"});
                oDDTextParam.push({CODE: "PRICEUNIT"});
                oDDTextParam.push({CODE: "CONVNUM"});
                oDDTextParam.push({CODE: "CONVDEN"});
                oDDTextParam.push({CODE: "NAME1"});
                oDDTextParam.push({CODE: "INFO_INPUT_DELVDATE"});
                oDDTextParam.push({CODE: "TEXT1"});
                oDDTextParam.push({CODE: "CHANGEPURPLANT"});
                oDDTextParam.push({CODE: "INFO_INVALID_CHANGE_PURPLANT"});
                oDDTextParam.push({CODE: "EXECUTE"});
                oDDTextParam.push({CODE: "REMARKS"});
                oDDTextParam.push({CODE: "WRAP"});
                oDDTextParam.push({CODE: "UNWRAP"});
                oDDTextParam.push({CODE: "LIFNR"});
                oDDTextParam.push({CODE: "DESC"});
                oDDTextParam.push({CODE: "MSEHI"});
                oDDTextParam.push({CODE: "MSEHL"});
                oDDTextParam.push({CODE: "SUPPLYTYP"});
                oDDTextParam.push({CODE: "SHORTTEXT"});
                oDDTextParam.push({CODE: "EXTENDPOOPTION"});
                oDDTextParam.push({CODE: "SELEXTENDPOITEMS"});
                oDDTextParam.push({CODE: "PONO"});
                oDDTextParam.push({CODE: "POEXTEND"});
                oDDTextParam.push({CODE: "EXTENDPO"});
                oDDTextParam.push({CODE: "INFO_SEL_REC_INVALID_DATA"});
                oDDTextParam.push({CODE: "CREATEINFOREC"});
                oDDTextParam.push({CODE: "INFO_CRTINFOREC_VALIDATE_DATA"});
                oDDTextParam.push({CODE: "INFO_WITH_INFOREC_ALREADY"});

                oModel.create("/CaptionMsgSet", { CaptionMsgItems: oDDTextParam  }, {
                    method: "POST",
                    success: function(oData, oResponse) {        
                        oData.CaptionMsgItems.results.forEach(item => {
                            oDDTextResult[item.CODE] = item.TEXT;
                        })

                        oJSONModel.setData(oDDTextResult);
                        that.getView().setModel(oJSONModel, "ddtext");
                        that.getOwnerComponent().getModel("CAPTION_MSGS_MODEL").setData({text: oDDTextResult})
                    },
                    error: function(err) {
                        sap.m.MessageBox.error(err);
                    }
                });

                this.getOwnerComponent().getModel("UI_MODEL").setData({
                    sbu: "",
                    flag: false
                })

                this.getOwnerComponent().getModel("COLUMN_FILTER_MODEL").setData({
                    items: []
                })

                this.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").setData({
                    items: []
                })

                var oTableEventDelegate = {
                    onkeyup: function(oEvent){
                        that.onKeyUp(oEvent);
                    },

                    onAfterRendering: function(oEvent) {
                        that.onAfterTableRendering(oEvent);
                    }
                };

                this.byId("mainTab").addEventDelegate(oTableEventDelegate);
                this._tableRendered = "";
                this._refresh = false;
                // this._colFilters = [];

                this._oModel.read("/UOMSet", {
                    success: function (oData, oResponse) {
                        that.getView().setModel(new JSONModel(oData.results), "uom");
                    },
                    error: function (err) { }
                });

                this._aColFilters = [], this._aColSorters = [];

                // this._oMultiInput = this.getView().byId("multiInputMatTyp");
                // this._oMultiInput.addValidator(this._onMultiInputValidate.bind(this));

                this._oModel.read("/IncoTermsSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "incoterm");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/incoterm", oData.results);
                    },
                    error: function (err) { }
                });      
                
                this._oModel.read("/SupplyTypeRscSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "supplyType");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/supplyType", oData.results);
                    },
                    error: function (err) { }
                });
    
                this._oModel.read("/UOMSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "uom");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/uom", oData.results);
                    },
                    error: function (err) { }
                });

                this._oModel.read("/CurrencyRscSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "currency");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/currency", oData.results);
                    },
                    error: function (err) { }
                });

                this._oModel.read("/CompanyRscSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "company");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/company", oData.results);
                    },
                    error: function (err) { }
                });

                this._oModel.read("/PlantRscSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "plant");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/plant", oData.results);
                    },
                    error: function (err) { }
                });

                this._oModel.read("/PurchGrpRscSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "purchgrp");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/purchgrp", oData.results);
                    },
                    error: function (err) { }
                });

                this._oModel.read("/PurchOrgSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "purchorg");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/purchorg", oData.results);
                    },
                    error: function (err) { }
                });

                this._oModel.read("/PayTermsSet", {
                    urlParameters: {
                        "$filter": "LIFNR eq 'ABCXYZ' and EKORG eq 'ABCD'"
                    },
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "payterm"); 
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/payterm", oData.results);
                    },
                    error: function (err) { }
                });

                this._oModel.read("/VendorSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "vendor");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/vendor", oData.results);
                    },
                    error: function (err) { }
                });

                this._oModel.read("/PODocTypSet", {
                    success: function (oData, oResponse) {
                        me.getView().setModel(new JSONModel(oData.results), "podoctyp");
                        me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/podoctyp", oData.results);
                    },
                    error: function (err) { }
                });

                this.getColumnProp();
            },

            onAfterRendering: function() {
                // var a = setInterval(() => {
                //     if (sap.ui.getCore().byId("backBtn") !== undefined) {
                //         console.log(sap.ui.getCore().byId("backBtn"))
                //         clearInterval(a);
                //     }
                // }, 1000);
            },

            onExit: function() {
                sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = this._fBackButton;
            },

            onSBUChange: function(oEvent) {
                this._sbuChange = true;
                var vSBU = this.getView().byId("cboxSBU").getSelectedKey();
                var oModel = this.getOwnerComponent().getModel("ZVB_3DERP_ANP_FILTERS_CDS");
                var me = this;

                if (this.getView().getModel("ui").getData().currsbu === vSBU) {
                    this.byId("searchFieldMain").setEnabled(true);
                    this.byId("btnAssign").setEnabled(true);
                    this.byId("btnUnassign").setEnabled(true);
                    this.byId("btnCreatePO").setEnabled(true);
                    this.byId("btnTabLayout").setEnabled(true);
                    this.byId("btnManualAssign").setEnabled(true);
                    this.byId("btnUpdPurPlant").setEnabled(true);
                    this.byId("btnCreateInfoRec").setEnabled(true);
                    this.byId("btnDataWrap").setEnabled(true);
                }
                else {
                    this.byId("searchFieldMain").setEnabled(false);
                    this.byId("btnAssign").setEnabled(false);
                    this.byId("btnUnassign").setEnabled(false);
                    this.byId("btnCreatePO").setEnabled(false);
                    this.byId("btnTabLayout").setEnabled(false);
                    this.byId("btnManualAssign").setEnabled(false);
                    this.byId("btnUpdPurPlant").setEnabled(false);
                    this.byId("btnCreateInfoRec").setEnabled(false);
                    this.byId("btnDataWrap").setEnabled(false);
                }

                oModel.read("/ZVB_3DERP_MATTYPE_SH", {
                    urlParameters: {
                        "$filter": "SBU eq '" + vSBU + "'"
                    },                    
                    success: function (oData, oResponse) {
                        // if (oData.results.length > 0){
                        //     var aData = new JSONModel({results: oData.results.filter(item => item.SBU === vSBU)});
                        //     me.getView().setModel(aData, "materialType");
                        // }
                        // else{
                        //     var aData = new JSONModel({results: []});
                        //     me.getView().setModel(aData, "materialType");
                        // }

                        me.getView().setModel(new JSONModel(oData.results.filter(item => item.SBU === vSBU)), "sfmMATERIALTYPE");
                    },
                    error: function (err) { }
                });
            },

            getColumnProp: async function() {
                var sPath = jQuery.sap.getModulePath("zuiaprocess", "/model/columns.json");
    
                var oModelColumns = new JSONModel();
                await oModelColumns.loadData(sPath);
    
                this._oModelColumns = oModelColumns.getData();
            },

            getColumns(arg) {
                var me = this;

                //get dynamic columns based on saved layout or ZERP_CHECK
                var oJSONColumnsModel = new JSONModel();
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");
                var vSBU = this.getView().getModel("ui").getData().sbu;

                oModel.setHeaders({
                    sbu: vSBU,
                    type: 'APROCESS',
                    tabname: 'ZDV_3DERP_ANP'
                });

                oModel.read("/ColumnsSet", {
                    success: function (oData, oResponse) {
                        oJSONColumnsModel.setData(oData);
                        me.getView().setModel(oJSONColumnsModel, "columns"); //set the view model
                        me._aColumns["main"] = oData.results;

                        if (oData.results.length > 0) {
                            if (arg === "AUTO_INIT") {
                                me.getInitTableData();
                            }
                            else {
                                me.getTableData();
                            }
                        }
                        else {
                            me.closeLoadingDialog();                           
                            var msg = me.getView().getModel("ddtext").getData()["INFO_NO_LAYOUT"];
                            sap.m.MessageBox.information(msg);

                            if (me.byId("mainTab").getColumns().length > 0) {
                                me.byId("mainTab").removeAllColumns();
                                me._counts.total = 0;
                                me._counts.unassigned = 0;
                                me._counts.partial = 0;
                                me.getView().getModel("counts").setData(me._counts);
                            }
                        }
                    },
                    error: function (err) {
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            getInitTableData: function () {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();

                //get styles data for the table
                var oJSONDataModel = new JSONModel(); 
                // var aFilters = this.getView().byId("SmartFilterBar").getFilters();
                // var oText = this.getView().byId("StylesCount"); //for the count of selected styles

                oModel.read("/MainSet", {
                    // filters: aFilters,
                    success: function (oData, oResponse) {
                        var vUnassigned = 0, vPartial = 0;

                        oData.results.forEach((item, index) => {
                            if (item.VENDOR === '') vUnassigned++;
                            if (item.QTY !== item.ORDEREDQTY && +item.ORDEREDQTY > 0) vPartial++;
                            item.DELVDATE = dateFormat.format(item.DELVDATE);
                            item.RECID = item.PRNUMBER + item.PRITEMNO;
                        })

                        oData.results.sort((a,b) => (a.RECID < b.RECID ? 1 : -1));

                        oData.results.forEach((item, index) => {
                            if (index === 0) item.ACTIVE = "X";
                            else item.ACTIVE = "";
                        })

                        me._counts.total = oData.results.length;
                        me._counts.unassigned = vUnassigned;
                        me._counts.partial = vPartial;
                        me.getView().getModel("counts").setData(me._counts);

                        // Common.closeLoadingDialog(that);
                        me.closeLoadingDialog();
                        // oText.setText(oData.results.length + "");
                        oJSONDataModel.setData(oData);
                        me.getView().setModel(oJSONDataModel, "mainData");
                        me.setTableData();
                        me.setTableColumns();
                        // me.setChangeStatus(false);
                    },
                    error: function (err) { 
                        Common.closeLoadingDialog(that);
                    }
                });
            },

            setTableData: function () {
                var me = this;

                //the selected dynamic columns
                var oColumnsModel = this.getView().getModel("columns");
                var oDataModel = this.getView().getModel("mainData");

                //the selected styles data
                var oColumnsData = oColumnsModel.getProperty('/results');
                var oData = oDataModel.getProperty('/results');
                var oModel = new JSONModel();

                oModel.setData({
                    columns: oColumnsData,
                    rows: oData
                });

                var oTable = this.getView().byId("mainTab");

                if (oTable.getColumns().length === 0) {
                    oTable.setModel(oModel);
                }
                else {
                    oTable.getModel().setProperty("/rows", oData);
                }

                //bind the data to the table
                oTable.bindRows("/rows");

                this.setActiveRowHighlight();
                this._tableRendered = "mainTab";
            },

            setTableColumns() {
                var me = this;
                var oTable = this.getView().byId("mainTab");
                var oColumns = oTable.getModel().getData().columns;

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

                    if (sColumnDataType === "NUMBER") {
                        return new sap.ui.table.Column({
                            id: sColumnId,
                            name: sColumnId,
                            label: new sap.m.Text({text: sColumnLabel}), 
                            template: me.columnTemplate(sColumnId, sTextWrapping),
                            width: sColumnWidth + 'px',
                            sortProperty: sColumnId,
                            // filterProperty: sColumnId,
                            autoResizable: true,
                            visible: sColumnVisible,
                            sorted: sColumnSorted,                        
                            hAlign: sColumnDataType === "NUMBER" ? "End" : sColumnDataType === "BOOLEAN" ? "Center" : "Begin",
                            sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending" )
                            // multiLabels: [
                            //     new sap.m.Text({text: sColumnLabel}),
                            //     new sap.m.Input({ 
                            //         value : "500",
                            //         editable: false
                            //     })
                            // ]
                        });                        
                    }
                    else {
                        return new sap.ui.table.Column({
                            id: sColumnId,
                            name: sColumnId,
                            label: new sap.m.Text({text: sColumnLabel}), 
                            template: me.columnTemplate(sColumnId, sColumnType, sTextWrapping),
                            width: sColumnWidth + 'px',
                            sortProperty: sColumnId,
                            // filterProperty: sColumnId,
                            autoResizable: true,
                            visible: sColumnVisible,
                            sorted: sColumnSorted,                        
                            hAlign: sColumnDataType === "NUMBER" ? "End" : sColumnDataType === "BOOLEAN" ? "Center" : "Begin",
                            sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending" )
                        });
                    }
                });

                var vWrap = oColumns[0].WrapText === "X" ? true : false;
                this.getView().getModel("ui").setProperty("/dataWrap/mainTab", vWrap);

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
                    console.log()
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

                TableFilter.updateColumnMenu("mainTab", this);
            },
            
            columnTemplate: function (sColumnId, sColumnType, sTextWrapping) {
                var oColumnTemplate;

                oColumnTemplate = new sap.m.Text({ 
                    text: "{" + sColumnId + "}", 
                    wrapping: sTextWrapping === "X" ? true : false,
                    tooltip: "{" + sColumnId + "}"
                }); //default text

                return oColumnTemplate;
            },

            getColumnSize: function (sColumnId, sColumnType) {
                //column width of fields
                var mSize = '7rem';
                // if (sColumnType === "SEL") {
                //     mSize = '5rem';
                // } else if (sColumnType === "COPY") {
                //     mSize = '4rem';
                // } else if (sColumnId === "STYLECD") {
                //     mSize = '25rem';
                // } else if (sColumnId === "DESC1" || sColumnId === "PRODTYP") {
                //     mSize = '15rem';
                // }
                return mSize;
            },

            setSmartFilterModel: function () {
                //Model StyleHeaderFilters is for the smartfilterbar
                var oModel = this.getOwnerComponent().getModel("ZVB_3DERP_ANP_FILTERS_CDS");               
                var oSmartFilter = this.getView().byId("smartFilterBar");
                oSmartFilter.setModel(oModel);
            },

            addDateFilters: function(aFilters) {
                //get the date filter of created date
                var delvDate = this.getView().byId("DelvDatePicker").getValue();
                    if(delvDate !== undefined && delvDate !== '') {
                        delvDate = delvDate.replace(/\s/g, '').toString(); //properly format the date for ABAP
                        var createDateStr = delvDate.split('–');
                        var delvDate = createDateStr[0];
                        var delvDate = createDateStr[1];
                        if(delvDate === undefined) {
                            delvDate = delvDate;
                        }
                        var lv_delvDateFilter = new sap.ui.model.Filter({
                            path: "CREATEDDT",
                            operator: sap.ui.model.FilterOperator.BT,
                            value1: delvDate,
                            value2: delvDate
                    });
                    
                    aFilters.push(lv_delvDateFilter);
                }
            },

            showLoadingDialog(arg) {
                if (!this._LoadingDialog) {
                    this._LoadingDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.LoadingDialog", this);
                    this.getView().addDependent(this._LoadingDialog);
                }
                // jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LoadingDialog);
                
                this._LoadingDialog.setTitle(arg);
                this._LoadingDialog.open();
            },

            closeLoadingDialog() {
                this._LoadingDialog.close();
            },

            showMessage: function(oMessage) {
                MessageToast.show(oMessage, {
                    duration: 3000,
                    animationDuration: 500
                });
            },

            onSearch: function () {
                //trigger search, reselect styles 
                var me = this;
                var vSBU = this.getView().byId("cboxSBU").getSelectedKey();                
                this.byId("searchFieldMain").setProperty("value", "");
                this.showLoadingDialog('Loading...');
                this.getView().getModel("ui").setProperty("/currsbu", vSBU);

                if (this.getView().getModel("ui").getData().sbu === '' || this._sbuChange) {
                    this.getColumns('MANUAL_INIT');

                    this._oModel.read("/ShipModeSet", {
                        urlParameters: {
                            "$filter": "SBU eq '" + vSBU + "'"
                        },
                        success: function (oData, oResponse) {
                            me.getView().setModel(new JSONModel(oData.results), "shipmode");
                            me.getOwnerComponent().getModel("LOOKUP_MODEL").setProperty("/shipmode", oData.results);
                        },
                        error: function (err) { }
                    });

                    this._sbuChange = false;
                }
                else {
                    if (this.getView().getModel("columns") === undefined) {
                        this.getColumns('SEARCH');
                    }
                    else {
                        if (this.getView().getModel("columns").getData().results.length === 0) {
                            this.getColumns('SEARCH');
                        }
                        else {
                            this.getTableData();
                        }
                    }
                } 
            },

            refresh() {
                this.getTableData(); 
            },

            getTableData() {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oJSONDataModel = new JSONModel();     
                
                var oSmartFilter = this.getView().byId("smartFilterBar").getFilters();
                var aFilters = [], aFilter = [], aSmartFilter = [];
                
                if (oSmartFilter.length > 0)  {
                    oSmartFilter[0].aFilters.forEach(item => {
                        if (item.sPath === "VENDOR") {
                            if (!isNaN(item.oValue1)) {
                                while (item.oValue1.length < 10) item.oValue1 = "0" + item.oValue1;
                            }
                        }

                        if (item.aFilters === undefined) {
                            aFilter.push(new Filter(item.sPath, item.sOperator, item.oValue1));
                        }
                        else {
                            aFilters.push(item);
                        }
                    })

                    if (aFilter.length > 0) { aFilters.push(new Filter(aFilter, false)); }
                }

                if (Object.keys(this._oSmartFilterCustomControlProp).length > 0) {
                    Object.keys(this._oSmartFilterCustomControlProp).forEach(item => {
                        var oCtrl = this.getView().byId("smartFilterBar").determineControlByName(item);

                        if (oCtrl) {
                            var aCustomFilter = [];
    
                            if (oCtrl.getTokens().length === 1) {
                                oCtrl.getTokens().map(function(oToken) {
                                    aFilters.push(new Filter(item, FilterOperator.EQ, oToken.getKey()))
                                })
                            }
                            else if (oCtrl.getTokens().length > 1) {
                                oCtrl.getTokens().map(function(oToken) {
                                    aCustomFilter.push(new Filter(item, FilterOperator.EQ, oToken.getKey()))
                                })
    
                                aFilters.push(new Filter(aCustomFilter));
                            }
                        }
                    })
                }

                aSmartFilter.push(new Filter(aFilters, true));
                this._oCurrentFilter = aSmartFilter;

                oModel.read("/MainSet", { 
                    filters: aSmartFilter,
                    success: function (oData, oResponse) {
                        var vUnassigned = 0, vPartial = 0;

                        oData.results.forEach((item, index) => {
                            if (item.VENDOR === '') vUnassigned++;
                            if (item.QTY !== item.ORDEREDQTY && +item.ORDEREDQTY > 0) vPartial++;
                            item.DELVDATE = dateFormat.format(item.DELVDATE);
                            item.RECID = item.PRNUMBER + item.PRITEMNO;
                        })

                        oData.results.sort((a,b) => (a.RECID < b.RECID ? 1 : -1));

                        oData.results.forEach((item, index) => {
                            if (index === 0) item.ACTIVE = "X";
                            else item.ACTIVE = "";
                        })

                        me._counts.total = oData.results.length;
                        me._counts.unassigned = vUnassigned;
                        me._counts.partial = vPartial;
                        me.getView().getModel("counts").setData(me._counts);

                        oJSONDataModel.setData(oData);
                        me.getView().setModel(oJSONDataModel, "mainData");
                        me.closeLoadingDialog();
                        me.setTableData();

                        if (me.byId('mainTab').getColumns().length === 0) me.setTableColumns();

                        me.byId("searchFieldMain").setEnabled(true);
                        me.byId("btnAssign").setEnabled(true);
                        me.byId("btnUnassign").setEnabled(true);
                        me.byId("btnCreatePO").setEnabled(true);
                        me.byId("btnTabLayout").setEnabled(true);
                        me.byId("btnManualAssign").setEnabled(true);
                        me.byId("btnUpdPurPlant").setEnabled(true);
                        me.byId("btnCreateInfoRec").setEnabled(true);
                        me.byId("btnDataWrap").setEnabled(true);
                    },
                    error: function (err) { 
                        me.closeLoadingDialog();
                    }
                });
            },

            onAssign: function() {
                var me = this;
                this._oAssignVendorData = [];
                this._oLock = [];
                this._refresh = false;

                var oTable = this.byId("mainTab");
                var oSelectedIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var aData = oTable.getModel().getData().rows;
                var oParamData = [];
                var oParam = {};
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var vSBU = this.getView().getModel("ui").getData().sbu;
                var vMatTypExist = false;
                var wVendor = false;

                if (oSelectedIndices.length > 0) {
                    this._oModel.read("/ZERPCheckSet", {
                        urlParameters: {
                            "$filter": "Sbu eq '" + vSBU + "' and Field1 eq 'INFORECORD'"
                        },
                        success: async function (oDataCheck, oResponse) {
                            oSelectedIndices.forEach(item => {
                                oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                            })

                            oSelectedIndices = oTmpSelectedIndices;
                            oSelectedIndices.forEach((item, index) => {
                                if (oDataCheck.results.length > 0) {
                                    if (oDataCheck.results.filter(fItem => fItem.Field2 === aData.at(item).MATERIALTYPE).length === 0) {
                                        if (aData.at(item).VENDOR === "") {
                                            oParamData.push({
                                                Vendor: aData.at(item).VENDOR,
                                                Material: aData.at(item).MATERIALNO,
                                                PurchOrg: aData.at(item).PURCHORG,
                                                PurGroup: '', //aData.at(item).PURCHGRP,
                                                Plant: ''
                                                // Plant: aData.at(item).PURCHPLANT
                                            })
                    
                                            me._oAssignVendorData.push({
                                                PRNUMBER: aData.at(item).PRNUMBER,
                                                PRITEMNO: aData.at(item).PRITEMNO,
                                                MATERIALNO: aData.at(item).MATERIALNO,
                                                IONUMBER: aData.at(item).IONUMBER,
                                                QTY: aData.at(item).QTY,
                                                UNIT: aData.at(item).UNIT,
                                                VENDOR: aData.at(item).VENDOR,
                                                PURCHORG: aData.at(item).PURCHORG,
                                                PURCHPLANT: aData.at(item).PURCHPLANT,
                                                PURCHGRP: aData.at(item).PURCHGRP,
                                                REMARKS: ''
                                            })
    
                                            me._oLock.push({
                                                Prno: aData.at(item).PRNUMBER,
                                                Prln: aData.at(item).PRITEMNO
                                            })
                                        } 
                                        else { wVendor = true; }
                                    }
                                    else vMatTypExist = true;
                                }
                                else {
                                    if (aData.at(item).VENDOR === "") {
                                        oParamData.push({
                                            Vendor: aData.at(item).VENDOR,
                                            Material: aData.at(item).MATERIALNO,
                                            PurchOrg: aData.at(item).PURCHORG,
                                            PurGroup: '', //aData.at(item).PURCHGRP,
                                            Plant: ''
                                            // Plant: aData.at(item).PURCHPLANT
                                        })
                
                                        me._oAssignVendorData.push({
                                            PRNUMBER: aData.at(item).PRNUMBER,
                                            PRITEMNO: aData.at(item).PRITEMNO,
                                            MATERIALNO: aData.at(item).MATERIALNO,
                                            IONUMBER: aData.at(item).IONUMBER,
                                            QTY: aData.at(item).QTY,
                                            UNIT: aData.at(item).UNIT,
                                            VENDOR: aData.at(item).VENDOR,
                                            PURCHORG: aData.at(item).PURCHORG,
                                            PURCHPLANT: aData.at(item).PURCHPLANT,
                                            PURCHGRP: aData.at(item).PURCHGRP,
                                            REMARKS: ''
                                        })
    
                                        me._oLock.push({
                                            Prno: aData.at(item).PRNUMBER,
                                            Prln: aData.at(item).PRITEMNO
                                        })
                                    }
                                    else { wVendor = true; }
                                }
                            })
                            
                            if (oParamData.length > 0) {
                                me.showLoadingDialog('Processing...');

                                var bProceed = await me.lock(me);
                                if (!bProceed) return;

                                oParamData = oParamData.filter((value, index, self) => self.findIndex(item => item.Vendor === value.Vendor && item.Material === value.Material && item.PurchOrg === value.PurchOrg) === index) ;
                                oParam['N_GetInfoRecMatParam'] = oParamData;
                                oParam['N_GetInfoRecReturn'] = [];

                                oModel.create("/GetInfoRecordSet", oParam, {
                                    method: "POST",
                                    success: function(oResult, oResponse) {
                                        var oManualAssignVendorData = [];
                                        oParamData = [];
                                        oParam = {};

                                        oSelectedIndices.forEach(selItemIdx => {
                                            var returnData = jQuery.extend(true, [], oResult.N_GetInfoRecReturn.results);

                                            if (aData.at(selItemIdx).VENDOR !== '') returnData = returnData.filter(fItem => fItem.Vendor === aData.at(selItemIdx).VENDOR);
                                            if (aData.at(selItemIdx).MATERIALNO !== '') returnData = returnData.filter(fItem => fItem.Material === aData.at(selItemIdx).MATERIALNO);
                                            // if (aData.at(selItemIdx).PURCHPLANT !== '') returnData = returnData.filter(fItem => fItem.Plant === aData.at(selItemIdx).PURCHPLANT);
                                            // if (aData.at(selItemIdx).PURCHGRP !== '') returnData = returnData.filter(fItem => fItem.PurGroup === aData.at(selItemIdx).PURCHGRP);
                                            if (aData.at(selItemIdx).PURCHORG !== '') returnData = returnData.filter(fItem => fItem.PurchOrg === aData.at(selItemIdx).PURCHORG);

                                            if (returnData.length > 0) {
                                                if (returnData[0].RetType === 'E') {
                                                    me._oAssignVendorData.filter(fItem => fItem.PRNUMBER === aData.at(selItemIdx).PRNUMBER && fItem.PRITEMNO === aData.at(selItemIdx).PRITEMNO)
                                                        .forEach(item => item.REMARKS = returnData[0].RetMessage);
                                                }
                                                else if (returnData.length === 1) {
                                                    // call function module ZFM_ERP_CHANGE_PR
                                                    oParamData.push({
                                                        PreqNo: aData.at(selItemIdx).PRNUMBER,
                                                        PreqItem: aData.at(selItemIdx).PRITEMNO,
                                                        Matno: aData.at(selItemIdx).MATERIALNO,
                                                        Uom: aData.at(selItemIdx).UNIT,
                                                        Quantity: aData.at(selItemIdx).QTY,
                                                        DelivDate: sapDateFormat.format(new Date(aData.at(selItemIdx).DELVDATE)) + "T00:00:00",
                                                        Batch: aData.at(selItemIdx).IONUMBER,
                                                        Plant: aData.at(selItemIdx).PURCHPLANT,
                                                        Purgrp: returnData[0].PurGroup,
                                                        Reqsnr: aData.at(selItemIdx).REQUISITIONER,
                                                        DesVendor: returnData[0].Vendor,
                                                        PurchOrg: returnData[0].PurchOrg,
                                                        Trackingno: aData.at(selItemIdx).TRACKINGNO,
                                                        Supplytyp: aData.at(selItemIdx).SUPPLYTYPE,
                                                        InfoRec: returnData[0].InfoRec,
                                                        Shiptoplant: aData.at(selItemIdx).SHIPTOPLANT,
                                                        Seasoncd: aData.at(selItemIdx).SEASON,
                                                        ShortText: aData.at(selItemIdx).SHORTTEXT,
                                                        Callbapi: 'X'
                                                    })                                        
                                                }
                                                else if (returnData.length > 1) {
                                                    returnData.forEach(item => {
                                                        item.PRNUMBER = aData.at(selItemIdx).PRNUMBER;
                                                        item.PRITEMNO = aData.at(selItemIdx).PRITEMNO;
                                                        item.MATERIALNO = aData.at(selItemIdx).MATERIALNO;
                                                        item.UNIT = aData.at(selItemIdx).UNIT;
                                                        item.QTY = aData.at(selItemIdx).QTY;
                                                        item.DELVDATE = aData.at(selItemIdx).DELVDATE;
                                                        item.IONUMBER = aData.at(selItemIdx).IONUMBER;
                                                        item.REQUISITIONER = aData.at(selItemIdx).REQUISITIONER;
                                                        item.TRACKINGNO = aData.at(selItemIdx).TRACKINGNO;
                                                        item.SUPPLYTYPE = aData.at(selItemIdx).SUPPLYTYPE;
                                                        item.SHIPTOPLANT = aData.at(selItemIdx).SHIPTOPLANT;
                                                        item.SEASON = aData.at(selItemIdx).SEASON;
                                                        item.SHORTTEXT = aData.at(selItemIdx).SHORTTEXT;
                                                        item.PURCHPLANT = aData.at(selItemIdx).PURCHPLANT;
                                                        
                                                        var oVendor = me.getView().getModel("vendor").getData().filter(fItem => fItem.LIFNR === item.Vendor);
                                                        if (oVendor.length > 0) { 
                                                            item.VENDORNAME = oVendor[0].NAME1;
                                                            item.VENDORCDNAME = oVendor[0].NAME1 + " (" + item.Vendor + ")";
                                                        }
                                                        else { 
                                                            item.VENDORNAME = "" ;
                                                            item.VENDORCDNAME = item.Vendor;
                                                        }
            
                                                        oManualAssignVendorData.push(item);
                                                    });
                                                }
                                            }
                                            else {
                                                me._oAssignVendorData.filter(fItem => fItem.PRNUMBER === aData.at(selItemIdx).PRNUMBER && fItem.PRITEMNO === aData.at(selItemIdx).PRITEMNO)
                                                    .forEach(item => item.REMARKS = 'No matching info record retrieve.');
                                            }
                                        })

                                        // Call change PR function module
                                        if (oParamData.length > 0) {
                                            oParam['N_ChangePRParam'] = oParamData;
                                            oParam['N_ChangePRReturn'] = [];

                                            oModel.create("/ChangePRSet", oParam, {
                                                method: "POST",
                                                success: function(oResultCPR, oResponse) {           
                                                    if (oResultCPR.N_ChangePRReturn.results.length > 0) {
                                                        me._oAssignVendorData.forEach(item => {
                                                            var oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER);

                                                            if (oRetMsg.length > 0) {
                                                                if (oRetMsg[0].Type === 'S') {
                                                                    oParamData.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO)
                                                                        .forEach(row => {
                                                                            if (item.VENDOR !== '' && item.VENDOR !== row.DesVendor) {
                                                                                item.REMARKS = 'Vendor updated.';
                                                                                item.VENDOR = row.DesVendor;
                                                                            }
                                                                            else if (item.VENDOR === '' && item.VENDOR !== row.DesVendor) {
                                                                                item.REMARKS = 'Vendor assigned.';
                                                                                item.VENDOR = row.DesVendor;
                                                                            }
                                                                            else if (item.PURCHORG !== '' && item.PURCHORG !== row.PurchOrg) {
                                                                                item.REMARKS = 'Purchasing Org updated.';
                                                                            }
                                                                            else {
                                                                                item.REMARKS = oRetMsg[0].Message;
                                                                            }
                                                                        })

                                                                        me._refresh = true;
                                                                }
                                                                else {
                                                                    item.REMARKS = oRetMsg[0].Message;
                                                                }
                                                            }
                                                            else {
                                                                item.REMARKS = 'No return message on PR change.';
                                                            }
                                                        })
                                                    }
            
                                                    // MessageBox.information(res.RetMsgSet.results[0].Message);
                                                    if (oManualAssignVendorData.length > 0) {
                                                        me.closeLoadingDialog();
                                                        // display pop-up for user selection
                                                        if (!me._AssignVendorDialog) {
                                                            me._AssignVendorDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.AssignVendorDialog", me);
            
                                                            me._AssignVendorDialog.setModel(
                                                                new JSONModel({
                                                                    items: oManualAssignVendorData,
                                                                    rowCount: oManualAssignVendorData.length > 6 ? oManualAssignVendorData.length : 6
                                                                })
                                                            )
            
                                                            me.getView().addDependent(me._AssignVendorDialog);
                                                        }
                                                        else {
                                                            me._AssignVendorDialog.getModel().setProperty("/items", oManualAssignVendorData);
                                                            me._AssignVendorDialog.getModel().setProperty("/rowCount", oManualAssignVendorData.length > 6 ? oManualAssignVendorData.length : 6);
                                                        }
            
                                                        me._AssignVendorDialog.open();
                                                    }
                                                    else {
                                                        me.closeLoadingDialog();
                                                        me.showAssignVendorResult("assign");
                                                    }
                                                },
                                                error: function() {
                                                    // alert("Error");
                                                }
                                            });
                                        }
                                        else if (oManualAssignVendorData.length > 0) {
                                            me.closeLoadingDialog();
                                            // display pop-up for user selection
                                            if (!me._AssignVendorDialog) {
                                                me._AssignVendorDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.AssignVendorDialog", me);
            
                                                me._AssignVendorDialog.setModel(
                                                    new JSONModel({
                                                        items: oManualAssignVendorData,
                                                        rowCount: oManualAssignVendorData.length > 6 ? oManualAssignVendorData.length : 6
                                                    })
                                                )
                                                
                                                me.getView().addDependent(me._AssignVendorDialog);
                                            }
                                            else {
                                                me._AssignVendorDialog.getModel().setProperty("/items", oManualAssignVendorData);
                                                me._AssignVendorDialog.getModel().setProperty("/rowCount", oManualAssignVendorData.length > 6 ? oManualAssignVendorData.length : 6);
                                            }

                                            me._AssignVendorDialog.open();
                                        }
                                        else {
                                            me.closeLoadingDialog();
                                            me.showAssignVendorResult("assign");
                                            me.unLock();
                                        }
                                    },
                                    error: function() {
                                        me.closeLoadingDialog();
                                        me.unLock();
                                    }
                                }); 
                            }
                            else {
                                me.closeLoadingDialog();
                                
                                if (vMatTypExist) {
                                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_INVALID_SEL_MATTYP"]);
                                }
                                else if (wVendor) {
                                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_VENDOR_ALREADY_ASSIGNED"]);
                                }
                                else {
                                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                                }
                            }
                        },
                        error: function (err) {
                            me.closeLoadingDialog();
                        }
                    });
                }
                else {
                    // aDataToEdit = aData;
                    me.closeLoadingDialog();
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                }
            },

            onAssignVendorManualSave: function(oEvent) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var oSource = oEvent.getSource();
                var oTable = oSource.oParent.getContent()[0];
                var oSelectedIndices = oTable.getSelectedIndices();
                var aData = oTable.getModel().getData().items;
                var oParamData = [];
                var oParam = {};

                if (oSelectedIndices.length > 0) {
                    oSelectedIndices.forEach((selItemIdx, index) => {
                        oParamData.push({
                            PR: aData.at(selItemIdx).PRNUMBER + aData.at(selItemIdx).PRITEMNO
                        })
                    })

                    if (oParamData.length !== oParamData.filter((value, index, self) => self.findIndex(item => item.PR === value.PR) === index).length) {
                        sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_SEL1_PR_ONLY"]);
                    }
                    else {
                        oParamData = [];
                        oParam = {};

                        oSelectedIndices.forEach((selItemIdx, index) => {
                            oParamData.push({
                                PreqNo: aData.at(selItemIdx).PRNUMBER,
                                PreqItem: aData.at(selItemIdx).PRITEMNO,
                                Matno: aData.at(selItemIdx).MATERIALNO,
                                Uom: aData.at(selItemIdx).UNIT,
                                Quantity: aData.at(selItemIdx).QTY,
                                DelivDate: sapDateFormat.format(new Date(aData.at(selItemIdx).DELVDATE)) + "T00:00:00",
                                Batch: aData.at(selItemIdx).IONUMBER,
                                Plant: aData.at(selItemIdx).PURCHPLANT,
                                Purgrp: aData.at(selItemIdx).PurGroup,
                                Reqsnr: aData.at(selItemIdx).REQUISITIONER,
                                DesVendor: aData.at(selItemIdx).Vendor,
                                PurchOrg: aData.at(selItemIdx).PurchOrg,
                                Trackingno: aData.at(selItemIdx).TRACKINGNO,
                                Supplytyp: aData.at(selItemIdx).SUPPLYTYPE,
                                InfoRec: aData.at(selItemIdx).InfoRec,
                                Shiptoplant: aData.at(selItemIdx).SHIPTOPLANT,
                                Seasoncd: aData.at(selItemIdx).SEASON,
                                ShortText: aData.at(selItemIdx).SHORTTEXT,
                                Callbapi: 'X'
                            })
                        })

                        oParam['N_ChangePRParam'] = oParamData;
                        oParam['N_ChangePRReturn'] = [];

                        oModel.create("/ChangePRSet", oParam, {
                            method: "POST",
                            success: function(oResultCPR, oResponse) {
                                if (oResultCPR.N_ChangePRReturn.results.length > 0) {
                                    me._oAssignVendorData.forEach(item => {
                                        var oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO);

                                        if (oRetMsg.length === 0)
                                            oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER);

                                        if (oRetMsg.length > 0) {
                                            if (oRetMsg[0].Type === 'S') {
                                                oParamData.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO)
                                                    .forEach(row => {
                                                        if (item.VENDOR !== '' && item.VENDOR !== row.DesVendor) {
                                                            item.REMARKS = 'Vendor updated.';
                                                        }
                                                        else if (item.VENDOR === '' && item.VENDOR !== row.DesVendor) {
                                                            item.REMARKS = 'Vendor assigned.';
                                                        }
                                                        else if (item.PURCHORG !== '' && item.PURCHORG !== row.PurchOrg) {
                                                            item.REMARKS = 'Purchasing Org updated.';
                                                        }
                                                        else {
                                                            item.REMARKS = oRetMsg[0].Message;
                                                        }

                                                        item.VENDOR = row.DesVendor;
                                                        me._refresh = true;
                                                    })
                                            }
                                            else {
                                                item.REMARKS = oRetMsg[0].Message;
                                            }
                                        }
                                        else {
                                            item.REMARKS = 'No return message on PR change.';
                                        }
                                    })
                                }

                                me.showAssignVendorResult("assign");
                                me._AssignVendorDialog.close();
                            },
                            error: function() {
                                me.unLock();
                            }
                        });                        
                    }
                }
                else {
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_SEL_RECORD_TO_PROC"]);
                }
            },

            onAssignVendorManualCancel: function(oEvent) {
                this._AssignVendorDialog.close();

                var oSource = oEvent.getSource();
                var oTable = oSource.oParent.getContent()[0];
                
                this._oAssignVendorData.forEach(item => {
                    oTable.getModel().getData().items.filter(fItem => fItem.PRNUMBER === item.PRNUMBER && fItem.PRITEMNO === item.PRITEMNO).forEach(rItem => item.REMARKS = "Assign vendor cancelled.");
                })

                this.showAssignVendorResult("assign");
            },

            onAssignVendorClose: function(oEvent) {
                if (this._refresh) { 
                    // if (this.byId("mainTab").getBinding("rows").aFilters.length > 0) {
                    //     this._aColFilters = this.byId("mainTab").getBinding("rows").aFilters;
                    //     this.getOwnerComponent().getModel("COLUMN_FILTER_MODEL").setProperty("/items", this._aColFilters);
                    // }

                    if (this.byId("mainTab").getBinding("rows").aSorters.length > 0) {
                        this._aColSorters = this.byId("mainTab").getBinding("rows").aSorters;
                        this.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").setProperty("/items", this._aColSorters);
                    }

                    this._selectedRecs = this._oAssignVendorData;
                    this.refreshTableData(); 
                }

                this._AssignVendorResultDialog.close();
                
                if (this._AssignVendorDialog !== undefined) {
                    var oTable = sap.ui.getCore().byId("assignVendorTab");
                    oTable.clearSelection();

                    this._AssignVendorDialog.close();
                }
            },

            showAssignVendorResult(arg) {
                // display pop-up for user selection
                this.unLock();
                var vRowCount = this._oAssignVendorData.length > 7 ? this._oAssignVendorData : 7;

                if (!this._AssignVendorResultDialog) {
                    this._AssignVendorResultDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.AssignVendorResultDialog", this);

                    this._AssignVendorResultDialog.setModel(
                        new JSONModel({
                            items: this._oAssignVendorData,
                            rowCount: vRowCount
                        })
                    )

                    this.getView().addDependent(this._AssignVendorResultDialog);
                }
                else {
                    this._AssignVendorResultDialog.getModel().setProperty("/items", this._oAssignVendorData);
                    this._AssignVendorResultDialog.getModel().setProperty("/rowCount", vRowCount);
                }

                if (arg === "assign") this._AssignVendorResultDialog.setTitle("Assign Vendor Result");
                else if (arg === "unassign") this._AssignVendorResultDialog.setTitle("Undo Assignment Result");
                else if (arg === "manual") this._AssignVendorResultDialog.setTitle("Manual Assign Vendor Result");

                this._AssignVendorResultDialog.open();
            },

            onManualAssign: async function (oEvent) {
                var me = this;
                this._oAssignVendorData = [];
                this._oLock = [];
                this._refresh = false;

                var oTable = this.byId("mainTab");
                var oSelectedIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var aData = oTable.getModel().getData().rows;
                var vSBU = this.getView().getModel("ui").getData().sbu;
                var vMatTypExist = true, vInvalid = false;

                if (oSelectedIndices.length > 0) {
                    oSelectedIndices.forEach(item => {
                        oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                    })

                    oSelectedIndices = oTmpSelectedIndices;

                    oSelectedIndices.forEach((item, index) => {
                        if (vInvalid || !vMatTypExist) return;

                        if (aData.at(item).VENDOR !== "" || aData.at(item).PURCHORG === "") vInvalid = true;

                        me._oAssignVendorData.push({
                            PRNUMBER: aData.at(item).PRNUMBER,
                            PRITEMNO: aData.at(item).PRITEMNO,
                            MATERIALNO: aData.at(item).MATERIALNO,
                            IONUMBER: aData.at(item).IONUMBER,
                            QTY: aData.at(item).QTY,
                            DELVDATE: aData.at(item).DELVDATE,
                            UNIT: aData.at(item).UNIT,
                            PURCHORG: aData.at(item).PURCHORG,
                            PURCHPLANT: aData.at(item).PURCHPLANT,
                            PURCHGRP: aData.at(item).PURCHGRP,
                            REQUISITIONER: aData.at(item).REQUISITIONER,
                            TRACKINGNO: aData.at(item).TRACKINGNO,
                            SUPPLYTYPE: aData.at(item).SUPPLYTYPE,
                            SHIPTOPLANT: aData.at(item).SHIPTOPLANT,
                            SEASON: aData.at(item).SEASON,
                            SHORTTEXT: aData.at(item).SHORTTEXT,
                            VENDOR: "",
                            EDITED: false,
                            REMARKS: ""
                        })

                        me._oLock.push({
                            Prno: aData.at(item).PRNUMBER,
                            Prln: aData.at(item).PRITEMNO
                        })
                    })
                    
                    if (vInvalid) {
                        sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_INVALID_SEL_MANUALASSIGNVENDOR"]);
                        me.closeLoadingDialog();
                    }
                    else {
                        me.showLoadingDialog('Processing...');

                        var bProceed = await me.lock(me);
                        if (!bProceed) return;

                        me.closeLoadingDialog();
                        me.showManualVendorAssignment(); 
                    }
                }
                else {
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                }
            },

            onManualAssign2: function (oEvent) {
                var me = this;
                this._oAssignVendorData = [];
                this._oLock = [];
                this._refresh = false;

                var oTable = this.byId("mainTab");
                var oSelectedIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var aData = oTable.getModel().getData().rows;
                var vSBU = this.getView().getModel("ui").getData().sbu;
                var vMatTypExist = true, vInvalid = false;

                if (oSelectedIndices.length > 0) {
                    this._oModel.read("/ZERPCheckSet", {
                        urlParameters: {
                            "$filter": "Sbu eq '" + vSBU + "' and Field1 eq 'INFORECORD'"
                        },
                        success: async function (oDataCheck, oResponse) {
                            oSelectedIndices.forEach(item => {
                                oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                            })

                            oSelectedIndices = oTmpSelectedIndices;

                            oSelectedIndices.forEach((item, index) => {
                                if (vInvalid || !vMatTypExist) return;

                                if (aData.at(item).VENDOR !== "" || aData.at(item).PURCHORG === "") vInvalid = true;

                                if (oDataCheck.results.length > 0) {
                                    if (oDataCheck.results.filter(fItem => fItem.Field2 === aData.at(item).MATERIALTYPE).length > 0) {               
                                        me._oAssignVendorData.push({
                                            PRNUMBER: aData.at(item).PRNUMBER,
                                            PRITEMNO: aData.at(item).PRITEMNO,
                                            MATERIALNO: aData.at(item).MATERIALNO,
                                            IONUMBER: aData.at(item).IONUMBER,
                                            QTY: aData.at(item).QTY,
                                            DELVDATE: aData.at(item).DELVDATE,
                                            UNIT: aData.at(item).UNIT,
                                            PURCHORG: aData.at(item).PURCHORG,
                                            PURCHPLANT: aData.at(item).PURCHPLANT,
                                            PURCHGRP: aData.at(item).PURCHGRP,
                                            REQUISITIONER: aData.at(item).REQUISITIONER,
                                            TRACKINGNO: aData.at(item).TRACKINGNO,
                                            SUPPLYTYPE: aData.at(item).SUPPLYTYPE,
                                            SHIPTOPLANT: aData.at(item).SHIPTOPLANT,
                                            SEASON: aData.at(item).SEASON,
                                            SHORTTEXT: aData.at(item).SHORTTEXT,
                                            VENDOR: "",
                                            EDITED: false,
                                            REMARKS: ""
                                        })

                                        me._oLock.push({
                                            Prno: aData.at(item).PRNUMBER,
                                            Prln: aData.at(item).PRITEMNO
                                        })

                                        vMatTypExist = true;
                                    }
                                    else vMatTypExist = false;
                                }
                                else {            
                                    me._oAssignVendorData.push({
                                        PRNUMBER: aData.at(item).PRNUMBER,
                                            PRITEMNO: aData.at(item).PRITEMNO,
                                            MATERIALNO: aData.at(item).MATERIALNO,
                                            IONUMBER: aData.at(item).IONUMBER,
                                            QTY: aData.at(item).QTY,
                                            DELVDATE: aData.at(item).DELVDATE,
                                            UNIT: aData.at(item).UNIT,
                                            PURCHORG: aData.at(item).PURCHORG,
                                            PURCHPLANT: aData.at(item).PURCHPLANT,
                                            PURCHGRP: aData.at(item).PURCHGRP,
                                            REQUISITIONER: aData.at(item).REQUISITIONER,
                                            TRACKINGNO: aData.at(item).TRACKINGNO,
                                            SUPPLYTYPE: aData.at(item).SUPPLYTYPE,
                                            SHIPTOPLANT: aData.at(item).SHIPTOPLANT,
                                            SEASON: aData.at(item).SEASON,
                                            SHORTTEXT: aData.at(item).SHORTTEXT,
                                            VENDOR: "",
                                            EDITED: false,
                                            REMARKS: ""
                                    })

                                    me._oLock.push({
                                        Prno: aData.at(item).PRNUMBER,
                                        Prln: aData.at(item).PRITEMNO
                                    })
                                }
                            })
                            
                            if (!vMatTypExist) {
                                sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_INVALID_SEL_MATTYP"]);
                                me.closeLoadingDialog();
                            }
                            else if (vInvalid) {
                                sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_INVALID_SEL_MANUALASSIGNVENDOR"]);
                                me.closeLoadingDialog();
                            }
                            else if (me._oAssignVendorData.length > 0) {
                                me.showLoadingDialog('Processing...');

                                var bProceed = await me.lock(me);
                                if (!bProceed) return;

                                me.closeLoadingDialog();
                                me.showManualVendorAssignment(); 
                            }
                            else {
                                sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                                me.closeLoadingDialog();
                            }
                        },
                        error: function (err) {
                            me.closeLoadingDialog();
                        }
                    });
                }
                else {
                    me.closeLoadingDialog();
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                }
            },

            showManualVendorAssignment() {
                var me = this;
                this._bAssignVendorManualChanged = false;
                this._validationErrors = [];
                var oData = jQuery.extend(true, [], this._oAssignVendorData);
                oData = oData.filter((value, index, self) => self.findIndex(item => item.MATERIALNO === value.MATERIALNO && item.PURCHORG === value.PURCHORG) === index);

                oData.forEach(item => {
                    item.VENDOR = "";
                    item.VENDORNAME = "";
                    item.CURR = "";
                    item.PAYTERMS = "";
                    item.INCO1 = "";
                    item.INCO2 = "";
                    item.EDITED = false;
                })

                var vRowCount = oData.length.length > 10 ? oData.length : 10;

                if (!me._AssignVendorManualDialog) {
                    me._AssignVendorManualDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.AssignVendorManualDialog", me);
                    
                    me._AssignVendorManualDialog.setModel(
                        new JSONModel({
                            rows: oData,
                            rowCount: vRowCount
                        })
                    )

                    me.getView().addDependent(me._AssignVendorManualDialog);

                    var oTableEventDelegate = {
                        onkeyup: function (oEvent) {
                            me.onKeyUp(oEvent);
                        },
    
                        onAfterRendering: function (oEvent) {
                            var oControl = oEvent.srcControl;
                            var sTabId = oControl.sId.split("--")[oControl.sId.split("--").length - 1];
    
                            if (sTabId.substr(sTabId.length - 3) === "Tab") me._tableRendered = sTabId;
                            else me._tableRendered = "";
    
                            me.onAfterTableRendering();
                        }
                    };

                    sap.ui.getCore().byId("assignVendorManualTab").addEventDelegate(oTableEventDelegate);
                }
                else {
                    me._AssignVendorManualDialog.getModel().setProperty("/rows", oData);
                    me._AssignVendorManualDialog.getModel().setProperty("/rowCount", vRowCount);
                }

                me._AssignVendorManualDialog.setTitle(me.getView().getModel("ddtext").getData()["MANUALASSIGNVENDOR"]);
                me._AssignVendorManualDialog.open();
                sap.ui.getCore().byId("assignVendorManualTab").focus();
            },

            beforeOpenAVM: function(oEvent) {
                var me = this;
                var oVendorSource = {};
                var oTable = sap.ui.getCore().byId("assignVendorManualTab");

                this._AssignVendorManualDialog.getModel().getData().rows.forEach((item, index) => {
                    var vMatNo = item.MATERIALNO;

                    this._oModel.read('/AssignVendorManuallySet', {
                        urlParameters: {
                            "$filter": "EKORG eq '" + item.PURCHORG + "'"
                        },
                        success: function (oData, oResponse) {
                            oData.results.sort((a,b) => (a.LIFNR > b.LIFNR ? 1 : -1));
                            oVendorSource[vMatNo] = oData.results;

                            // oTable.getRows()[index].getCells()[1].bindAggregation("suggestionItems", {
                            //     path: "vendor>/" + vMatNo,
                            //     length: 10000,
                            //     template: new sap.ui.core.ListItem({
                            //         key: "{vendor>LIFNR}",
                            //         text: "{vendor>LIFNR}",
                            //         additionalText: "{vendor>NAME1}"
                            //     })
                            // });

                            TableValueHelp.setStaticTableSuggestion(me, oTable, "assignVendorManualTab", oTable.getRows()[index].getCells()[1], vMatNo);
                            oTable.getRows()[index].getCells()[1].setValueState("None");

                            if (me._AssignVendorManualDialog.getModel().getData().rows.length === (index + 1)) {
                                me.getView().setModel(new JSONModel(oVendorSource), "vendor");
                            }
                        },
                        error: function (err) { }
                    })
                })
            },

            onManualAV: function(oEvent) {
                if (this._validationErrors.length === 0) {
                    var oTable = sap.ui.getCore().byId("assignVendorManualTab");
                    var oSelectedIndices = oTable.getSelectedIndices();
                    var oTmpSelectedIndices = [];
                    var aData = this._AssignVendorManualDialog.getModel().getData().rows;
                    var bProceed = true;
                    var oParamData = [];
                    var oParam = {};
                    var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");  
                    var me = this;

                    if (oSelectedIndices.length === 0) {
                        //process all rows
                        if (aData.filter(fItem => fItem.VENDOR === "").length === 0) {
                            me.showLoadingDialog('Processing...');

                            this._oAssignVendorData.forEach((item, index) => {
                                var sVendor = aData.filter(fItem => fItem.MATERIALNO === item.MATERIALNO && fItem.PURCHORG === item.PURCHORG)[0].VENDOR;

                                oParamData.push({
                                    PreqNo: item.PRNUMBER,
                                    PreqItem: item.PRITEMNO,
                                    Matno: item.MATERIALNO,
                                    Uom: item.UNIT,
                                    Quantity: item.QTY,
                                    DelivDate: sapDateFormat.format(new Date(item.DELVDATE)) + "T00:00:00",
                                    Batch: item.IONUMBER,
                                    Plant: item.PURCHPLANT,
                                    Purgrp: item.PURCHGRP,
                                    Reqsnr: item.REQUISITIONER,
                                    DesVendor: sVendor,
                                    PurchOrg: item.PURCHORG,
                                    Trackingno: item.TRACKINGNO,
                                    Supplytyp: item.SUPPLYTYPE,
                                    InfoRec: "",
                                    Shiptoplant: item.SHIPTOPLANT,
                                    Seasoncd: item.SEASON,
                                    ShortText: item.SHORTTEXT,
                                    Callbapi: 'X'
                                })
                            })
    
                            oParam['N_ChangePRParam'] = oParamData;
                            oParam['N_ChangePRReturn'] = [];

                            oModel.create("/ChangePRSet", oParam, {
                                method: "POST",
                                success: function(oResultCPR, oResponse) {   
                                    if (oResultCPR.N_ChangePRReturn.results.length > 0) {
                                        me._oAssignVendorData.forEach(item => {
                                            var oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO);
    
                                            if (oRetMsg.length === 0)
                                                oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER);
    
                                            if (oRetMsg.length > 0) {
                                                if (oRetMsg[0].Type === 'S') {
                                                    oParamData.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO)
                                                        .forEach(row => {
                                                            if (item.VENDOR !== '' && item.VENDOR !== row.DesVendor) {
                                                                item.REMARKS = 'Vendor updated.';
                                                            }
                                                            else if (item.VENDOR === '' && item.VENDOR !== row.DesVendor) {
                                                                item.REMARKS = 'Vendor assigned.';
                                                            }
                                                            else if (item.PURCHORG !== '' && item.PURCHORG !== row.PurchOrg) {
                                                                item.REMARKS = 'Purchasing Org updated.';
                                                            }
                                                            else {
                                                                item.REMARKS = oRetMsg[0].Message;
                                                            }
    
                                                            item.VENDOR = row.DesVendor;
                                                            me._refresh = true;
                                                        })
                                                }
                                                else {
                                                    item.REMARKS = oRetMsg[0].Message;
                                                }
                                            }
                                            else {
                                                item.REMARKS = 'No return message on PR change.';
                                            }
                                        })
                                    }
    
                                    me.closeLoadingDialog();
                                    me.showAssignVendorResult("manual");
                                    me._AssignVendorManualDialog.close();
                                },
                                error: function() {
                                    me.unLock();
                                }
                            }); 
                        }
                        else {
                            MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_INPUT_REQD_FIELDS"])
                        }
                    }
                    else {
                        oSelectedIndices.forEach(item => {
                            oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                        })

                        oSelectedIndices = oTmpSelectedIndices;

                        oSelectedIndices.forEach((item, index) => {
                            if (aData.at(item).VENDOR === "") bProceed = false;
                        })

                        if (bProceed) {
                            me.showLoadingDialog('Processing...');

                            oSelectedIndices.forEach((item, index) => {
                                this._oAssignVendorData.filter(fItem => fItem.MATERIALNO === aData.at(item).MATERIALNO && fItem.PURCHORG === aData.at(item).PURCHORG)
                                    .forEach(oItem => {
                                        oParamData.push({
                                            PreqNo: oItem.PRNUMBER,
                                            PreqItem: oItem.PRITEMNO,
                                            Matno: oItem.MATERIALNO,
                                            Uom: oItem.UNIT,
                                            Quantity: oItem.QTY,
                                            DelivDate: sapDateFormat.format(new Date(oItem.DELVDATE)) + "T00:00:00",
                                            Batch: oItem.IONUMBER,
                                            Plant: oItem.PURCHPLANT,
                                            Purgrp: oItem.PURCHGRP,
                                            Reqsnr: oItem.REQUISITIONER,
                                            DesVendor: aData.at(item).VENDOR,
                                            PurchOrg: oItem.PURCHORG,
                                            Trackingno: oItem.TRACKINGNO,
                                            Supplytyp: oItem.SUPPLYTYPE,
                                            InfoRec: "",
                                            Shiptoplant: oItem.SHIPTOPLANT,
                                            Seasoncd: oItem.SEASON,
                                            ShortText: oItem.SHORTTEXT,
                                            Callbapi: 'X'
                                        })

                                        oItem.REMARKS = "Process";
                                    })
                            })

                            oParam['N_ChangePRParam'] = oParamData;
                            oParam['N_ChangePRReturn'] = [];

                            oModel.create("/ChangePRSet", oParam, {
                                method: "POST",
                                success: function(oResultCPR, oResponse) {   
                                    if (oResultCPR.N_ChangePRReturn.results.length > 0) {
                                        me._oAssignVendorData.forEach(item => {
                                            var oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO);
    
                                            if (oRetMsg.length === 0)
                                                oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER);
    
                                            if (oRetMsg.length > 0) {
                                                if (oRetMsg[0].Type === 'S') {
                                                    oParamData.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO)
                                                        .forEach(row => {
                                                            if (item.VENDOR !== '' && item.VENDOR !== row.DesVendor) {
                                                                item.REMARKS = 'Vendor updated.';
                                                            }
                                                            else if (item.VENDOR === '' && item.VENDOR !== row.DesVendor) {
                                                                item.REMARKS = 'Vendor assigned.';
                                                            }
                                                            else if (item.PURCHORG !== '' && item.PURCHORG !== row.PurchOrg) {
                                                                item.REMARKS = 'Purchasing Org updated.';
                                                            }
                                                            else {
                                                                item.REMARKS = oRetMsg[0].Message;
                                                            }
    
                                                            item.VENDOR = row.DesVendor;
                                                            me._refresh = true;
                                                        })
                                                }
                                                else {
                                                    item.REMARKS = oRetMsg[0].Message;
                                                }
                                            }
                                            else {
                                                if (item.REMARKS === "Process") {
                                                    item.REMARKS = 'No return message on PR change.';
                                                }
                                                else {
                                                    item.REMARKS = 'Skip, manual assign not process.';
                                                }
                                            }
                                        })
                                    }
    
                                    me.closeLoadingDialog();
                                    me.showAssignVendorResult("manual");
                                    me._AssignVendorManualDialog.close();
                                },
                                error: function() {
                                    me.unLock();
                                }
                            });
                        }
                        else {
                            MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_CHECK_INVALID_ENTRIES"]);
                        }
                    }
                }
                else {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_CHECK_INVALID_ENTRIES"]);
                }
            },

            onCancelAVM: function(oEvent) {
                var oData = {
                    Text: this.getView().getModel("ddtext").getData()["CONFIRM_CANCEL_ASSIGNVENDOR"]
                }
    
                if (!this._ConfirmDialog) {
                    this._ConfirmDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ConfirmDialog", this);
    
                    this._ConfirmDialog.setModel(new JSONModel(oData));
                    this.getView().addDependent(this._ConfirmDialog);
                }
                else this._ConfirmDialog.setModel(new JSONModel(oData));
                    
                this._ConfirmDialog.open();
            },

            onUpdPurPlant: async function(oEvent) {
                var me = this;
                this._oAssignPurPlantData = [];
                this._oLock = [];
                this._refresh = false;

                var oTable = this.byId("mainTab");
                var oSelectedIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var aData = oTable.getModel().getData().rows;
                var vInvalid = false;
                var vCtr = 0;
                var bError = false;
                var aSelectedData = [];

                if (oSelectedIndices.length > 0) {
                    oSelectedIndices.forEach(item => {
                        oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                    })

                    oSelectedIndices = oTmpSelectedIndices;

                    oSelectedIndices.forEach((item, index) => {
                        if (vInvalid) return;

                        if (aData.at(item).VENDOR === "" || aData.at(item).SHIPTOPLANT === "") vInvalid = true;

                        aSelectedData.push({
                            PRNUMBER: aData.at(item).PRNUMBER,
                            PRITEMNO: aData.at(item).PRITEMNO,
                            SHIPTOPLANT: aData.at(item).SHIPTOPLANT,
                            MATERIALNO: aData.at(item).MATERIALNO,
                            IONUMBER: aData.at(item).IONUMBER,
                            QTY: aData.at(item).QTY,
                            DELVDATE: aData.at(item).DELVDATE,
                            UNIT: aData.at(item).UNIT,
                            PURCHORG: aData.at(item).PURCHORG,
                            PURCHPLANT: aData.at(item).PURCHPLANT,
                            PURCHGRP: aData.at(item).PURCHGRP,
                            REQUISITIONER: aData.at(item).REQUISITIONER,
                            TRACKINGNO: aData.at(item).TRACKINGNO,
                            SUPPLYTYPE: aData.at(item).SUPPLYTYPE,
                            SEASON: aData.at(item).SEASON,
                            SHORTTEXT: aData.at(item).SHORTTEXT,
                            INFORECORD: aData.at(item).INFORECORD,
                            VENDOR: aData.at(item).VENDOR,
                            REMARKS: ""
                        })

                        me._oLock.push({
                            Prno: aData.at(item).PRNUMBER,
                            Prln: aData.at(item).PRITEMNO
                        })
                    })
                    
                    if (vInvalid) {
                        sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_INVALID_CHANGE_PURPLANT"]);
                        me.closeLoadingDialog();
                    }
                    else {
                        me.showLoadingDialog('Processing...');

                        var bProceed = await me.lock(me);
                        if (!bProceed) {
                            me.closeLoadingDialog();
                            return;
                        }

                        [...new Set(aSelectedData.map(item => item.SHIPTOPLANT))].forEach((item, index) => {
                            this._oAssignPurPlantData.push({
                                GROUP: index + 1,
                                SHIPTOPLANT: item,
                                STATUS: "NW",
                                REMARKS: "",
                                ITEMS: aSelectedData.filter(fItem => fItem.SHIPTOPLANT === item),
                                PLANTS: []
                            })
                        });

                        this._oAssignPurPlantData.forEach(val => {
                            if (bError) { return; }

                            this._oModel.read("/PurchPlantSet", {
                                urlParameters: {
                                    "$filter": "SHIPTOPLANT eq '" + val.SHIPTOPLANT +"'"
                                },
                                success: function (oData, oResponse) {
                                    vCtr++;
                                    // console.log(oData);
                                    me._oAssignPurPlantData.filter(fItem => fItem.SHIPTOPLANT === oData.results[0].SHIPTOPLANT).forEach(item => {
                                        item.PLANTS = oData.results;
                                    })
                                    // console.log(me._oAssignPurPlantData);
                                    if (vCtr === me._oAssignPurPlantData.length) {                                       
                                        var vRowCount = me._oAssignPurPlantData[0].PLANTS.length > 10 ? me._oAssignPurPlantData[0].PLANTS.length : 10;
    
                                        if (!me._ChangePurPlantDialog) {
                                            me._ChangePurPlantDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ChangePurPlantDialog", me);
                                            
                                            me._ChangePurPlantDialog.setModel(
                                                new JSONModel({
                                                    rows: me._oAssignPurPlantData[0].PLANTS,
                                                    rowCount: vRowCount
                                                })
                                            )
        
                                            me.getView().addDependent(me._ChangePurPlantDialog);
        
                                            // var oTableEventDelegate = {
                                            //     onkeyup: function (oEvent) {
                                            //         me.onKeyUp(oEvent);
                                            //     },
                            
                                            //     onAfterRendering: function (oEvent) {
                                            //         var oControl = oEvent.srcControl;
                                            //         var sTabId = oControl.sId.split("--")[oControl.sId.split("--").length - 1];
                            
                                            //         if (sTabId.substr(sTabId.length - 3) === "Tab") me._tableRendered = sTabId;
                                            //         else me._tableRendered = "";
                            
                                            //         me.onAfterTableRendering();
                                            //     }
                                            // };
        
                                            // sap.ui.getCore().byId("purPlantTab").addEventDelegate(oTableEventDelegate);
                                        }
                                        else {
                                            sap.ui.getCore().byId("purPlantTab").clearSelection();
                                            me._ChangePurPlantDialog.getModel().setProperty("/rows", me._oAssignPurPlantData[0].PLANTS);
                                            me._ChangePurPlantDialog.getModel().setProperty("/rowCount", vRowCount);
                                        }
        
                                        if (me._oAssignPurPlantData.length === 1) {
                                            sap.ui.getCore().byId("btnCancelAllCPP").setVisible(false);
                                        }
                                        else {
                                            sap.ui.getCore().byId("btnCancelAllCPP").setVisible(true);
                                        }

                                        me.closeLoadingDialog();                                       
                                        me._ChangePurPlantDialog.setTitle(me.getView().getModel("ddtext").getData()["CHANGEPURPLANT"]);
                                        me._ChangePurPlantDialog.open();                                        
                                        sap.ui.getCore().byId("purPlantTab").focus();
                                    }
                                },
                                error: function (err) { 
                                    bError = true;
                                    me.closeLoadingDialog();
                                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_ERROR"] + ": " + err.message);
                                    return;
                                }
                            });
                        })
                    }
                }
                else {
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                }
            },

            execUpdPurPlant: function(oEvent) {
                var me = this;
                var oTable = sap.ui.getCore().byId("purPlantTab");
                var oParam = {};
                var oParamData = [];
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");  
                var oCurrGrpData = this._oAssignPurPlantData.filter(fItem => fItem.SHIPTOPLANT === this._ChangePurPlantDialog.getModel().getData().rows[0].SHIPTOPLANT);

                if (oTable.getSelectedIndices().length === 0) {
                    sap.m.MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                    return;
                }
                
                oCurrGrpData[0].ITEMS.forEach(item => {
                    oParamData.push({
                        PreqNo: item.PRNUMBER,
                        PreqItem: item.PRITEMNO,
                        Matno: item.MATERIALNO,
                        Uom: item.UNIT,
                        Quantity: item.QTY,
                        DelivDate: sapDateFormat.format(new Date(item.DELVDATE)) + "T00:00:00",
                        Batch: item.IONUMBER,
                        Plant: oCurrGrpData[0].PLANTS[oTable.getSelectedIndices()[0]].PURPLANT,
                        Purgrp: item.PURCHGRP,
                        Reqsnr: item.REQUISITIONER,
                        DesVendor: item.VENDOR,
                        PurchOrg: item.PURCHORG,
                        Trackingno: item.TRACKINGNO,
                        Supplytyp: item.SUPPLYTYPE,
                        InfoRec: item.INFORECORD,
                        Shiptoplant: item.SHIPTOPLANT,
                        Seasoncd: item.SEASON,
                        ShortText: item.SHORTTEXT,
                        Callbapi: 'X'
                    })
                })
                // console.log(oParamData)
                oParam['N_ChangePRParam'] = oParamData;
                oParam['N_ChangePRReturn'] = [];

                me.showLoadingDialog('Processing...');

                oModel.create("/ChangePRSet", oParam, {
                    method: "POST",
                    success: function(oResultCPR, oResponse) {   
                        console.log(oResultCPR)
                        if (oResultCPR.N_ChangePRReturn.results.length > 0) {
                            oCurrGrpData[0].ITEMS.forEach(item => {
                                var oRetMsg = []; //oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO);

                                if (oRetMsg.length === 0)
                                    oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER);

                                if (oRetMsg.length > 0) {
                                    if (oRetMsg.filter(fItem => fItem.Type === "E").length > 0) {
                                        oRetMsg.forEach(msg => {
                                            if (msg.Type === "E") {
                                                item.REMARKS += msg.Message + ". \r\n";
                                            }
                                        })
                                    }
                                    else if (oRetMsg.filter(fItem => fItem.Type === "S").length > 0) {
                                        oRetMsg.forEach(msg => {
                                            if (msg.Type === "S" && item.REMARKS === "") {
                                                item.REMARKS = msg.Message + ". ";
                                            }
                                        })
                                    }
                                }
                                else {
                                    item.REMARKS = 'No return message on PR change.';
                                }
                            })
                            
                            oCurrGrpData[0].STATUS = "PR";
                            oCurrGrpData[0].REMARKS = "Processed";
                            me._refresh = true;
                        }

                        me.closeLoadingDialog();
                        me.onUpdPurPlantNextGrp(oCurrGrpData[0].GROUP);
                    },
                    error: function() {
                        me.closeLoadingDialog();
                        me.onUpdPurPlantNextGrp(oCurrGrpData[0].GROUP);                        
                    }
                });
            },

            onUpdPurPlantNextGrp(currGrp) {
                if (currGrp === this._oAssignPurPlantData.length) {
                    this._ChangePurPlantDialog.close();
                    this.showUpdPurPlantResult();
                    return;
                }

                sap.ui.getCore().byId("purPlantTab").clearSelection();
                this._ChangePurPlantDialog.getModel().setProperty("/rows", this._oAssignPurPlantData[currGrp].PLANTS);
            },       

            onCancelUpdPurPlant: function(oEvent) {
                var oCurrGrpData = this._oAssignPurPlantData.filter(fItem => fItem.SHIPTOPLANT === this._ChangePurPlantDialog.getModel().getData().rows[0].SHIPTOPLANT)[0];
                oCurrGrpData.STATUS = "CA";
                oCurrGrpData.REMARKS = "Cancelled";

                oCurrGrpData.ITEMS.forEach(item => item.REMARKS = "Cancelled")

                if (oCurrGrpData.GROUP === this._oAssignPurPlantData.length) {
                    this._ChangePurPlantDialog.close();
                    this.showUpdPurPlantResult();
                    return;
                }

                oTable.clearSelection();
                this._ChangePurPlantDialog.getModel().setProperty("/rows", me._oAssignPurPlantData[vCurrGrp].PLANTS);
            },

            onCancelAllUpdPurPlant: function(oEvent) {
                this._oAssignPurPlantData.filter(fItem => fItem.REMARKS === "").forEach(grp => {
                    grp.STATUS = "CA";
                    grp.REMARKS = "Cancelled";

                    grp.ITEMS.forEach(item => item.REMARKS = "Cancelled");
                })

                this._ChangePurPlantDialog.close();
                this.showUpdPurPlantResult();
            },

            showUpdPurPlantResult() {
                this.unLock();

                var oDataResult = [];

                this._oAssignPurPlantData.forEach(grp => {
                    grp.ITEMS.forEach(item => {
                        oDataResult.push({
                            PRNUMBER: item.PRNUMBER,
                            PRITEMNO: item.PRITEMNO,
                            SHIPTOPLANT: item.SHIPTOPLANT,
                            REMARKS: item.REMARKS
                        })
                    })
                })

                var vRowCount = oDataResult.length > 7 ? oDataResult : 7;

                if (!this._ChangePurPlantResultDialog) {
                    this._ChangePurPlantResultDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ChangePurPlantResultDialog", this);

                    this._ChangePurPlantResultDialog.setModel(
                        new JSONModel({
                            items: oDataResult,
                            rowCount: vRowCount
                        })
                    )

                    this.getView().addDependent(this._ChangePurPlantResultDialog);
                }
                else {
                    this._ChangePurPlantResultDialog.getModel().setProperty("/items", oDataResult);
                    this._ChangePurPlantResultDialog.getModel().setProperty("/rowCount", vRowCount);
                }

                this._ChangePurPlantResultDialog.open();
            },

            onUpdPurPlantResultClose: function(oEvent) {
                if (this._refresh) { 
                    if (this.byId("mainTab").getBinding("rows").aSorters.length > 0) {
                        this._aColSorters = this.byId("mainTab").getBinding("rows").aSorters;
                        this.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").setProperty("/items", this._aColSorters);
                    }

                    this._selectedRecs = [];
                    this._oAssignPurPlantData.forEach(grp => {
                        grp.ITEMS.forEach(item => {
                            this._selectedRecs.push(item);
                        })
                    })
                    // console.log(this._selectedRecs);
                    this.refreshTableData(); 
                }

                this._ChangePurPlantResultDialog.close();
            },

            onGetInfoRecList: function() {
                var me = this;
                this._oCreateInfoRecData = [];
                this._oLock = [];
                this._refresh = false;
                this._sMessage = "";

                var oTable = this.byId("mainTab");
                var oSelectedIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var aData = oTable.getModel().getData().rows;
                var oParamData = [];
                var oParam = {};
                var oModel = this.getOwnerComponent().getModel();
                var vSBU = this.getView().getModel("ui").getData().sbu;
                var vMatTypExist = false;
                var wVendor = false;
                var bProceed = true;

                if (oSelectedIndices.length > 0) {
                    me.showLoadingDialog('Processing...');

                    this._oModel.read("/ZERPCheckSet", {
                        urlParameters: {
                            "$filter": "Sbu eq '" + vSBU + "' and Field1 eq 'INFORECORD'"
                        },
                        success: async function (oDataCheck, oResponse) {
                            oSelectedIndices.forEach(item => {
                                oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                            })

                            oSelectedIndices = oTmpSelectedIndices;
                            oSelectedIndices.forEach((item, index) => {
                                if (oDataCheck.results.length > 0) {
                                    if (oDataCheck.results.filter(fItem => fItem.Field2 === aData.at(item).MATERIALTYPE).length === 0) {
                                        if (!(aData.at(item).VENDOR === "" || aData.at(item).MATERIALNO === "" || aData.at(item).PURCHGRP === "" || aData.at(item).PURCHORG === "")) {
                                            oParamData.push({
                                                LIFNR: aData.at(item).VENDOR,
                                                MATNR: aData.at(item).MATERIALNO,
                                                EKORG: aData.at(item).PURCHORG,
                                                EKGRP: aData.at(item).PURCHGRP
                                            })
                    
                                            me._oCreateInfoRecData.push({
                                                PRNUMBER: aData.at(item).PRNUMBER,
                                                PRITEMNO: aData.at(item).PRITEMNO,
                                                MATERIALNO: aData.at(item).MATERIALNO,
                                                MATERIALGRP: aData.at(item).MATERIALGRP,
                                                IONUMBER: aData.at(item).IONUMBER,
                                                QTY: aData.at(item).QTY,
                                                UNIT: aData.at(item).UNIT,
                                                VENDOR: aData.at(item).VENDOR,
                                                VENDORNAME: aData.at(item).VENDORNAME,
                                                PURCHORG: aData.at(item).PURCHORG,
                                                PURCHPLANT: aData.at(item).PURCHPLANT,
                                                PURCHGRP: aData.at(item).PURCHGRP,
                                                ADDTLDESC: aData.at(item).ADDTLDESC,
                                                REMARKS: ''
                                            })
    
                                            me._oLock.push({
                                                Prno: aData.at(item).PRNUMBER,
                                                Prln: aData.at(item).PRITEMNO
                                            })
                                        } 
                                        else { 
                                            wVendor = false; 
                                            me._sMessage += me.getView().getModel("ddtext").getData()["INFO_CRTINFOREC_VALIDATE_DATA"] + "\r\n";
                                        }
                                    }
                                    else {
                                        vMatTypExist = true;
                                        me._sMessage += me.getView().getModel("ddtext").getData()["INFO_INVALID_SEL_MATTYP"] + "\r\n";
                                    }
                                }
                                else {
                                    if (!(aData.at(item).VENDOR === "" || aData.at(item).MATERIALNO === "" || aData.at(item).PURCHGRP === "" || aData.at(item).PURCHORG === "")) {
                                        oParamData.push({
                                            LIFNR: aData.at(item).VENDOR,
                                            MATNR: aData.at(item).MATERIALNO,
                                            EKORG: aData.at(item).PURCHORG,
                                            EKGRP: aData.at(item).PURCHGRP
                                        })
                
                                        me._oCreateInfoRecData.push({
                                            PRNUMBER: aData.at(item).PRNUMBER,
                                            PRITEMNO: aData.at(item).PRITEMNO,
                                            MATERIALNO: aData.at(item).MATERIALNO,
                                            MATERIALGRP: aData.at(item).MATERIALGRP,
                                            IONUMBER: aData.at(item).IONUMBER,
                                            QTY: aData.at(item).QTY,
                                            UNIT: aData.at(item).UNIT,
                                            VENDOR: aData.at(item).VENDOR,
                                            VENDORNAME: aData.at(item).VENDORNAME,
                                            PURCHORG: aData.at(item).PURCHORG,
                                            PURCHPLANT: aData.at(item).PURCHPLANT,
                                            PURCHGRP: aData.at(item).PURCHGRP,
                                            ADDTLDESC: aData.at(item).ADDTLDESC,
                                            REMARKS: ''
                                        })
    
                                        me._oLock.push({
                                            Prno: aData.at(item).PRNUMBER,
                                            Prln: aData.at(item).PRITEMNO
                                        })
                                    }
                                    else { 
                                        wVendor = false; 
                                        me._sMessage += me.getView().getModel("ddtext").getData()["INFO_CRTINFOREC_VALIDATE_DATA"] + "\r\n";
                                    }
                                }
                            })
                            
                            if (oParamData.length > 0) {
                                bProceed = await me.lock(me);
                                if (!bProceed) return;

                                oParamData = oParamData.filter((value, index, self) => self.findIndex(item => item.LIFNR === value.LIFNR && item.MATNR === value.MATNR && item.EKORG === value.EKORG && item.EKGRP === value.EKGRP) === index);
                                oParam['N_InfoRecItem'] = oParamData;
                                oParam['N_InfoRecReturn'] = [];

                                oModel.create("/InfoRecSet", oParam, {
                                    method: "POST",
                                    success: async function(oResult, oResponse) {
                                        me.closeLoadingDialog();

                                        if (oResult.N_InfoRecReturn.results.length === 0) {
                                            me.unLock();

                                            var sMessage = "";

                                            if (me._sMessage !== "") {
                                                sMessage = me.getView().getModel("ddtext").getData()["INFO_SEL_REC_INVALID_DATA"] + "\r\n";
                                                sMessage += me._sMessage;
                                            }
                                            
                                            sMessage += me.getView().getModel("ddtext").getData()["INFO_WITH_INFOREC_ALREADY"] + "\r\n";
                                            sap.m.MessageBox.information(sMessage);
                                        }
                                        else {
                                            me.showInfoRecCreation(oResult.N_InfoRecReturn);

                                            bProceed = await me.getInfoRecListColumns(me);

                                            if (bProceed) {
                                                me.setRowEditMode("inforec");
                                                me._CreateInfoRecDialog.open();
                                            }
                                        }
                                    },
                                    error: function() {
                                        me.closeLoadingDialog();
                                        me.unLock();
                                    }
                                }); 
                            }
                            else {
                                me.closeLoadingDialog();

                                var sMessage = me.getView().getModel("ddtext").getData()["INFO_SEL_REC_INVALID_DATA"] + "\r\n" + me._sMessage;
                                sap.m.MessageBox.information(sMessage);
                            }
                        },
                        error: function (err) {
                            me.closeLoadingDialog();
                        }
                    });
                }
                else {
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                }
            },

            showInfoRecCreation(validData) {
                var oData = [];

                validData.results.forEach(item => {
                    var tabData = this._oCreateInfoRecData.filter(fItem => fItem.VENDOR === item.VENDOR && fItem.MATERIALNO === item.MATNO && fItem.PURCHGRP === item.PURCHGRP && fItem.PURCHORG === item.PURCHORG);
                    
                    oData.push({
                        INFNR: "",
                        REMARKS: "",
                        PURORG: tabData[0].PURCHORG,
                        VENDORCD: tabData[0].VENDOR,
                        MATNO: tabData[0].MATERIALNO,
                        MATGRPCD: tabData[0].MATERIALGRP,
                        PURGRP: tabData[0].PURCHGRP,
                        SALESPERSON: "",
                        TELNO: "",
                        BASEUOM: tabData[0].UNIT,
                        ORDERUOM: "",
                        NUMERATOR: "",
                        DENOMINATOR: "",
                        DATAB: dateFormat.format(new Date()),
                        DATBI: dateFormat.format(new Date("9999-12-31")),
                        UNITPRICE: "",
                        WAERS: item.CURR,
                        PEINH: "1",
                        NAME1: tabData[0].VENDORNAME,
                        DESCEN: tabData[0].ADDTLDESC,
                        PURPLANT: tabData[0].PURCHPLANT,
                        UOMCONV: false
                    })
                })

                if (!this._CreateInfoRecDialog) {
                    // this.getView().setModel(new JSONModel(oData), "GENINFORECDataModel");
                    this._CreateInfoRecDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.CreateInfoRecDialog", this);

                    // this._CreateInfoRecDialog.setModel(
                    //     new JSONModel({
                    //         rows: oData,
                    //         rowCount: oData.length
                    //     })
                    // )

                    this.getView().addDependent(this._CreateInfoRecDialog);
                }
                else {
                    // this._CreateInfoRecDialog.getModel().setProperty("/rows", oData);
                    // this._CreateInfoRecDialog.getModel().setProperty("/rowCount", oData.length);
                }

                var oTable = sap.ui.getCore().byId("inforecTab");

                oTable.setModel(new JSONModel({ 
                    columns: [],
                    rows: [] 
                }));

                oTable.getModel().setProperty("/rows", oData);
                oTable.bindRows("/rows");

                this._CreateInfoRecDialog.setTitle(this.getView().getModel("ddtext").getData()["CREATEINFOREC"]);
                this._sActiveTable = "inforecTab";
            },

            onCreateInfoRec: function () {
                if (this.validationErrors.length > 0) {
                    MessageBox.information(this.getView().getModel("ddtext").getData()["INFO_CHECK_INVALID_ENTRIES"]);
                    return;
                }

                this.showLoadingDialog('Processing...');

                var me = this;
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var oTable = sap.ui.getCore().byId("inforecTab");
                var oParam = {};
                var oInput = [];
                var vSBU = me.getView().getModel("ui").getData().sbu;

                var infnrData = sap.ui.getCore().byId("inforecTab").getModel().getData().rows;
                console.log("infnrData", infnrData);

                infnrData.forEach(item => {
                    console.log(sapDateFormat.format(new Date(item.DATBI)) + "T00:00:00");
                    oInput.push({
                        Ekorg: item.PURORG,                                 //PURCHASING ORG
                        Lifnr: item.VENDORCD,                               //VENDOR CD
                        Matnr: item.MATNO,                                  //MATERIAL NO
                        Verkf: item.SALESPERSON,                            //SALES PERSON
                        Telf1: item.TELNO,                                  //TELEPHONE NO
                        Meins: item.BASEUOM,                                //BASE UNIT
                        Bstme: item.ORDERUOM,                               //ORDER UNIT
                        Umren: item.NUMERATOR,                              //NUMERATOR
                        Umrez: item.DENOMINATOR,                            //DENOMINATOR
                        Ekgrp: item.PURGRP,                                 //PURCHASING GROUP
                        Norbm: "1",                                         //PURCHASE ORDER REQD QTY
                        Webre: true,                                        // GR BASED IV
                        Datab: me.formatDateToYYYYMMDD(new Date(item.DATAB)) + "T00:00:00",  //VALID FROM DATE
                        Datbi: me.formatDateToYYYYMMDD(new Date(item.DATBI)) + "T00:00:00",  //VALID TO DATE
                        Netpr: item.UNITPRICE,                              //NET PRICE
                        Waers: item.WAERS,                                  //CURRENCYCD
                        Peinh: item.PEINH,                                  //PRICE UNIT
                        Meins2: "",                                         //UNIT OF MEASURE OF 2ND QUANTITY   
                        // Aplfz: "",                                          //PLANNED DLV TIME
                        Name1: item.NAME1,                                  //VENDOR NAME
                        Maktx: item.DESCEN,                               //MATERIAL DESCRIPTION
                        Purplant: item.PURPLANT                             //PURCHASING
                    });
                });
                
                console.log(oInput);

                // return;

                oParam["SBU"] = vSBU;
                oParam["N_CreateInfoRecParam"] = oInput;
                oParam["N_CreateInfoRecReturn"] = [];

                console.log("oParam", oParam);
                oModel.setUseBatch(false);
                oModel.create("/CreateInfoRecordSet", oParam, {
                    method: "POST",
                    success: async function (oDataReturn, oResponse) {
                        //assign the materials based on the return
                        console.log(oDataReturn);
                        me.closeLoadingDialog();

                        oDataReturn.N_CreateInfoRecReturn.results.forEach(iReturn => {
                            infnrData.filter(fData => fData.MATNO === iReturn.Matnr)
                                .forEach(iData => {
                                    iData.REMARKS = iData.REMARKS + " " + iReturn.Message;
                                    iData.INFNR = iReturn.Infnr;
                                })
                        });
                        
                        await oTable.getModel().refresh(true);
                        await oTable.unbindRows(); // Unbind rows
                        await oTable.bindRows("/rows"); // Rebind rows

                        me.setRowReadMode("inforec");
                        sap.ui.getCore().byId("btnINFNRSubmit").setVisible(false);
                        sap.ui.getCore().byId("btnINFNRCancel").setVisible(false);
                        sap.ui.getCore().byId("btnINFNRClose").setVisible(true);
                    },
                    error: function (err) {
                        // Common.closeLoadingDialog(me);
                    }
                })
            },

            // onCancelInfoRec: function(oEvent) {                
            //     this._CreateInfoRecDialog.close();
            //     this.getView().removeDependent(this._CreateInfoRecDialog);
            //     this._sActiveTable = "mainTab";
            // },

            onCloseInfoRec: function () {
                this._CreateInfoRecDialog.close();
                this._CreateInfoRecDialog.destroy();
                this._CreateInfoRecDialog = null;
                this._sActiveTable = "mainTab";
                this.unLock();
            },

            getInfoRecListColumns: async (me) => {
                var oModel = me.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");
                var vSBU = me.getView().getModel("ui").getData().sbu;

                oModel.setHeaders({
                    sbu: vSBU,
                    type: 'ANPINFRECLIST',
                    tabname: 'ZDV_IOINFREC'
                });

                var promise = new Promise((resolve, reject) => {
                    oModel.read("/ColumnsSet", {
                        success: function (oData, oResponse) {
                            if (oData.results.length > 0) {
                                if (me._oModelColumns["inforec"] !== undefined) {
                                    oData.results.forEach(item => {
                                        me._oModelColumns["inforec"].filter(loc => loc.name === item.ColumnName)
                                            .forEach(col => {
                                                item.ValueHelp = col.ValueHelp;
                                                item.TextFormatMode = col.TextFormatMode;
                                            })
                                    })
                                }

                                me.setInfoRecListColumns(oData.results);
                                resolve(true);
                            }
                            else {
                                sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_LAYOUT"]);
                                resolve(false);
                            }

                            me._aColumns["inforec"] = oData.results;
                        },
                        error: function (err) {
                            resolve(false);
                        }
                    })
                })

                return await promise;
            },

            setInfoRecListColumns(oColumns) {
                var me = this;
                var oTable = sap.ui.getCore().byId("inforecTab");

                // oTable.removeAllColumns();
                oTable.getModel().setProperty("/columns", oColumns);

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
                    // var bEditable = context.getObject().Editable;
                    // console.log(context.getObject())

                    if (sColumnWidth === 0) sColumnWidth = 100;

                    var oText = new sap.m.Text({
                        wrapping: sTextWrapping === "X" ? true : false,
                        tooltip: sColumnDataType === "BOOLEAN" ? "" : "{" + sColumnId + "}"
                    })

                    if (sColumnId === "BASEUOM") {
                        oText.bindText({  
                            parts: [  
                                { path: sColumnId }
                            ],  
                            formatter: function(sColumnId) {
                                var oValue = me.getView().getModel("uom").getData().filter(v => v.MSEHI === sColumnId);

                                if (oValue && oValue.length > 0) {
                                    return oValue[0].MSEHL + " (" + sColumnId + ")";
                                }
                                else return sColumnId;
                            }
                        });
                    }
                    else if (sColumnId === "WAERS") {
                        oText.bindText({  
                            parts: [  
                                { path: sColumnId }
                            ],  
                            formatter: function(sColumnId) {
                                var oValue = me.getView().getModel("currency").getData().filter(v => v.WAERS === sColumnId);

                                if (oValue && oValue.length > 0) {
                                    return oValue[0].LTEXT + " (" + sColumnId + ")";
                                }
                                else return sColumnId;
                            }
                        });
                    }
                    else {
                        oText.bindText({  
                            parts: [  
                                { path: sColumnId }
                            ]
                        }); 
                    }

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
                });

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
                    console.log()
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

                // TableFilter.updateColumnMenu("mainTab", this);
            },

            columnTemplate2: function (sColumnId, sTextWrapping, bEditable) {
                var oColumnTemplate;

                if (bEditable) {
                    oColumnTemplate = new sap.m.Input({ 
                        value: "{" + sColumnId + "}", 
                        wrapping: sTextWrapping === "X" ? true : false,
                        tooltip: "{" + sColumnId + "}"
                    });
                }
                else {
                    oColumnTemplate = new sap.m.Text({ 
                        text: "{" + sColumnId + "}", 
                        wrapping: sTextWrapping === "X" ? true : false,
                        tooltip: "{" + sColumnId + "}"
                    });
                }

                return oColumnTemplate;
            },

            setRowEditMode(arg) {
                var me = this;
                var oTable = this.byId(arg + "Tab");

                if (oTable === undefined) {
                    oTable = sap.ui.getCore().byId(arg + "Tab");
                }
                
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
                                        change: this.onValueHelpInputChange.bind(this)
                                    })
        
                                    oInput.setSuggestionRowValidator(this.suggestionRowValidator);
        
                                    if (bValueFormatter) {
                                        oInput.setProperty("textFormatMode", sTextFormatMode)
        
                                        oInput.bindValue({  
                                            parts: [{ path: sColName }, { value: ci.ValueHelp["items"].path }, { value: ci.ValueHelp["items"].value }, { value: ci.ValueHelp["items"].text }, { value: sTextFormatMode }],
                                            formatter: this.formatValueHelp.bind(this)
                                        });
                                    }
                                    else {
                                        oInput.bindValue({  
                                            parts: [  
                                                { path: sColName }
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
                                        value: {
                                            path: sColName,
                                            formatOptions: {
                                                minFractionDigits: ci.Decimal,
                                                maxFractionDigits: ci.Decimal
                                            },
                                            constraints: {
                                                precision: ci.Length,
                                                scale: ci.Decimal
                                            }
                                        },
                                        liveChange: this.onNumberLiveChange.bind(this),
                                        enabled: {
                                            path: "UOMCONV",
                                            formatter: function (UOMCONV) {
                                                if (sColName === "NUMERATOR" || sColName === "DENOMINATOR") {
                                                    if (UOMCONV) { return false }
                                                    else { return true }
                                                }
                                                else { return true }
                                            }
                                        } 
                                    }).addEventDelegate(oInputEventDelegate));
                                }
                                else if (ci.DataType === "DATE" || ci.DataType === "DATETIME") {
                                    col.setTemplate(new sap.m.DatePicker({
                                        value: "{" + sColName + "}",
                                        displayFormat: "MM/dd/yyyy",
                                        valueFormat: "MM/dd/yyyy"
                                    }).addEventDelegate(oInputEventDelegate))
                                }
                                else {
                                    col.setTemplate(new sap.m.Input({
                                        type: "Text",
                                        value: "{" + sColName + "}",
                                        maxLength: ci.Length
                                    }).addEventDelegate(oInputEventDelegate));
                                }
        
                                if (ci.required) {
                                    col.getLabel().addStyleClass("sapMLabelRequired");
                                }
                            }
                        })                    
                })
    
                // this.getView().getModel(arg).getData().forEach(item => item.EDITED = false);
            },

            onInputKeyDown(oEvent) {
                if (oEvent.key === "ArrowUp" || oEvent.key === "ArrowDown") {
                    //prevent increase/decrease of number value
                    oEvent.preventDefault();
    
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

            handleValueHelp: function(oEvent) {
                var oSource = oEvent.getSource();
   
                this._inputId = oSource.getId();
                this._inputValue = oSource.getValue();
                this._inputSource = oSource;
                this._inputField = oSource.getBindingInfo("value").parts[0].path;
   
                var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
                var vMatNo = this._AssignVendorManualDialog.getModel().getProperty(sRowPath + "/MATERIALNO");
                var vh = this.getView().getModel("vendor").getData()[vMatNo];                
                this.getView().setModel(new JSONModel(vh), "vendors");
                
                vh.forEach(item => {
                    item.VHTitle = item.LIFNR;
                    item.VHSelected = (item.LIFNR === this._inputValue);
                })

                vh.sort((a,b) => (a.VHTitle > b.VHTitle ? 1 : -1));
                
                var oVHModel = new JSONModel({
                    items: vh,
                    title: "Vendor"
                });  
                
                // create value help dialog
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment(
                        "zuiaprocess.view.fragments.valuehelp.ValueHelpDialog",
                        this
                    );
                    
                    this._valueHelpDialog.setModel(oVHModel);
                    this.getView().addDependent(this._valueHelpDialog);
                }
                else {
                    this._valueHelpDialog.setModel(oVHModel);
                }                            

                this._valueHelpDialog.open();
            },
    
            handleValueHelpClose : function (oEvent) {
                if (oEvent.sId === "confirm") {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
    
                    if (oSelectedItem) {
                        this._inputSource.setValue(oSelectedItem.getTitle());
    
                        if (this._inputValue !== oSelectedItem.getTitle()) {        
                            var sRowPath = this._inputSource.getBindingInfo("value").binding.oContext.sPath;
                            var vMatNo = this._AssignVendorManualDialog.getModel().getProperty(sRowPath + "/MATERIALNO");
                            var vh = this.getView().getModel("vendor").getData()[vMatNo].filter(fItem => fItem.LIFNR === oSelectedItem.getTitle());
                            
                            this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', vh[0].NAME1);                           
                            this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', vh[0].WAERS);
                            this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', vh[0].ZTERM);                           
                            this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', vh[0].INCO1);
                            this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', vh[0].INCO2);                           
                            this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/EDITED', true);
                            this._bAssignVendorManualChanged = true;
                        }
                    }
    
                    this._inputSource.setValueState("None");
                }
                else if (oEvent.sId === "cancel") { }
            },
    
            handleValueHelpChange: function(oEvent) {   
                var oSource = oEvent.getSource();
                var isInvalid = !oSource.getSelectedKey() && oSource.getValue().trim();
                oSource.setValueState(isInvalid ? "Error" : "None");
    
                var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;

                oSource.getSuggestionItems().forEach(item => {
                    if (item.getProperty("key") === oSource.getValue().trim()) {
                        isInvalid = false;
                        oSource.setValueState(isInvalid ? "Error" : "None");
                    }
                })
    
                if (isInvalid) this._validationErrors.push(oEvent.getSource().getId());
                else {
                    this._validationErrors.forEach((item, index) => {
                        if (item === oEvent.getSource().getId()) {
                            this._validationErrors.splice(index, 1)
                        }
                    })
                }

                this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/EDITED', true);
                this._bAssignVendorManualChanged = true;
            },

            handleSuggestionItemSelected: function (oEvent) {
                var oSource = oEvent.getSource();
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
                
                if (oSelectedItem !== null) {
                    var vMatNo = this._AssignVendorManualDialog.getModel().getProperty(sRowPath + "/MATERIALNO");
                    var oVendor = this.getView().getModel("vendor").getData()[vMatNo].filter(fItem => fItem.LIFNR === oSelectedItem.getKey());
                    
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', oVendor[0].NAME1);                           
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', oVendor[0].WAERS);
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', oVendor[0].ZTERM);                           
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', oVendor[0].INCO1);
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', oVendor[0].INCO2);
                }
                else {
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', "");
                }

                this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/EDITED', true);
                this._bAssignVendorManualChanged = true;
            },

            handleStaticValueHelp: function(oEvent) {
                var oSource = oEvent.getSource();
   
                this._inputId = oSource.getId();
                this._inputValue = oSource.getValue();
                this._inputSource = oSource;
                this._inputField = oSource.getBindingInfo("value").parts[0].path;

                var sRowPath = oSource.getBindingInfo("value").binding.oContext.sPath;
                var vMatNo = this._AssignVendorManualDialog.getModel().getProperty(sRowPath + "/MATERIALNO");                
                this.getView().setModel(new JSONModel(this.getView().getModel("vendor").getData()[vMatNo]), "vendors");

                TableValueHelp.handleStaticTableValueHelp(oEvent, this);
            },

            onStaticValueHelpInputChange: function(oEvent) {
                var oSource = oEvent.getSource();
                var isInvalid = !oSource.getSelectedKey() && oSource.getValue().trim();
                var sPath = oSource.getBindingInfo("value").parts[0].path;
                var sRowPath = oSource.oParent.getBindingContext().sPath;

                oSource.setValueState(isInvalid ? "Error" : "None");

                // oSource.getSuggestionItems().forEach(item => {
                //     if (item.getProperty("key") === oSource.getValue().trim()) {
                //         isInvalid = false;
                //         oSource.setValueState(isInvalid ? "Error" : "None");
                //     }
                // })
    
                // oSource.getSuggestionItems().forEach(item => {
                //     if (item.getProperty("key") === oSource.getValue().trim()) {
                //         isInvalid = false;
                //         oSource.setValueState(isInvalid ? "Error" : "None");
                //     }
                // })
    
                if (isInvalid) { 
                    this._validationErrors.push(oEvent.getSource().getId());

                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', "");
                }
                else {
                    var vValue = oSource.getSelectedKey();

                    if (oSource.getSelectedKey() === "") {
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', "");
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', "");
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', "");
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', "");
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', "");
                    }
                    else {
                        var vMatNo = this._AssignVendorManualDialog.getModel().getProperty(sRowPath + "/MATERIALNO");
                        var oVendor = this.getView().getModel("vendor").getData()[vMatNo].filter(fItem => fItem.LIFNR === vValue);
                        
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', oVendor[0].NAME1);
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', oVendor[0].WAERS);
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', oVendor[0].ZTERM);                           
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', oVendor[0].INCO1);
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', oVendor[0].INCO2);
                    }

                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + "/" + sPath, vValue);

                    if (oSource.getSelectedKey() === "") { oSource.setSelectedKey(vValue); }

                    this._validationErrors.forEach((item, index) => {
                        if (item === oEvent.getSource().getId()) {
                            this._validationErrors.splice(index, 1)
                        }
                    })
                }
            },

            onValueHelpInputChange: function(oEvent) {
                if (this._validationErrors === undefined) this._validationErrors = [];
    
                var oSource = oEvent.getSource();
                var isInvalid = !oSource.getSelectedKey() && oSource.getValue().trim();
                oSource.setValueState(isInvalid ? "Error" : "None");
    
                var sRowPath = "";
                var vValue = oSource.getSelectedKey();
                var sModel = oSource.getBindingInfo("value").parts[0].model;
                var oTableModel;
                
                if (sModel === undefined) { sModel = "" }

                if (isInvalid) this._validationErrors.push(oEvent.getSource().getId());
                else {
                    this._validationErrors.forEach((item, index) => {
                        if (item === oEvent.getSource().getId()) {
                            this._validationErrors.splice(index, 1)
                        }
                    })
                }

                var oTable = this.byId(this._sActiveTable);

                if (oTable === undefined) {
                    oTable = sap.ui.getCore().byId(this._sActiveTable);
                }

                if (oTable.getModel(sModel) === undefined) {
                    oTableModel =  oTable.getModel();
                    sRowPath = oSource.oParent.getBindingContext().sPath;
                }
                else {
                    oTableModel =  oTable.getModel(sModel);
                    sRowPath = oSource.oParent.getBindingContext(sModel).sPath;
                }

                if (oSource.getBindingInfo("value").parts[0].path === "ORDERUOM") {
                    var vBaseUOM = oTableModel.getProperty(sRowPath + '/BASEUOM');
                    this.convertUOM(vBaseUOM, vValue, oTableModel, sRowPath);
                }

                oTableModel.setProperty(sRowPath + '/' + oSource.getBindingInfo("value").parts[0].path, vValue);
                if (oSource.getSelectedKey() === "") { oSource.setSelectedKey(vValue); }
    
                // this._bHeaderChanged = true;
            },

            onNumberLiveChange: function(oEvent) {
                if (this._validationErrors === undefined) this._validationErrors = [];
    
                var vDecPlaces = oEvent.getSource().getBindingInfo("value").parts[0].constraints.scale;
                var vDigitNumber = oEvent.getSource().getBindingInfo("value").parts[0].constraints.precision;
    
                if (oEvent.getParameters().value.split(".").length > 1) {
                    if (vDecPlaces === 0) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText("Enter a number without decimals.");
                        this.validationErrors.push(oEvent.getSource().getId());
                    }
                    else if (oEvent.getParameters().value.split(".")[1].length > vDecPlaces) {
                        // console.log("invalid");
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText("Enter a number with a maximum of " + vDecPlaces + " decimal places.");
                        this.validationErrors.push(oEvent.getSource().getId());
                    }
                    else if (oEvent.getParameters().value.split(".")[0].length > (vDigitNumber - vDecPlaces))  {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText("Enter a number with a maximum of " + (vDigitNumber - vDecPlaces)  + " whole number.");
                        this.validationErrors.push(oEvent.getSource().getId());
                    }
                    else {
                        oEvent.getSource().setValueState("None");
                        this.validationErrors.forEach((item, index) => {
                            if (item === oEvent.getSource().getId()) {
                                this.validationErrors.splice(index, 1)
                            }
                        })
                    }
                }
                else if (oEvent.getParameters().value.length > (vDigitNumber - vDecPlaces))  {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Enter a number with a maximum of " + (vDigitNumber - vDecPlaces)  + " whole number.");
                    this.validationErrors.push(oEvent.getSource().getId());
                }
                else {
                    oEvent.getSource().setValueState("None");
                    this.validationErrors.forEach((item, index) => {
                        if (item === oEvent.getSource().getId()) {
                            this.validationErrors.splice(index, 1)
                        }
                    })
                }
            },

            onUnassign: async function() {
                this._oAssignVendorData = [];
                this._oLock = [];
                this._refresh = false;

                var me = this;
                var oTable = this.byId("mainTab");
                var oSelectedIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var aData = oTable.getModel().getData().rows;
                var oParamData = [];
                var oParam = {};
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");

                if (oSelectedIndices.length > 0) {
                    oSelectedIndices.forEach(item => {
                        oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                    })

                    oSelectedIndices = oTmpSelectedIndices;

                    oSelectedIndices.forEach((selItemIdx, index) => {
                        if (aData.at(selItemIdx).VENDOR !== '') {
                            oParamData.push({
                                PreqNo: aData.at(selItemIdx).PRNUMBER,
                                PreqItem: aData.at(selItemIdx).PRITEMNO,
                                Matno: aData.at(selItemIdx).MATERIALNO,
                                Uom: aData.at(selItemIdx).UNIT,
                                Quantity: aData.at(selItemIdx).QTY,
                                DelivDate: sapDateFormat.format(new Date(aData.at(selItemIdx).DELVDATE)) + "T00:00:00",
                                Batch: aData.at(selItemIdx).IONUMBER,
                                Plant: aData.at(selItemIdx).PURCHPLANT,
                                Purgrp: aData.at(selItemIdx).PURCHGRP,
                                Reqsnr: aData.at(selItemIdx).REQUISITIONER,
                                DesVendor: '',
                                PurchOrg: aData.at(selItemIdx).PURCHORG,
                                Trackingno: aData.at(selItemIdx).TRACKINGNO,
                                Supplytyp: aData.at(selItemIdx).SUPPLYTYPE,
                                InfoRec: '',
                                Shiptoplant: aData.at(selItemIdx).SHIPTOPLANT,
                                Seasoncd: aData.at(selItemIdx).SEASON,
                                ShortText: aData.at(selItemIdx).SHORTTEXT,
                                Callbapi: 'X'
                            })
    
                            this._oAssignVendorData.push({
                                PRNUMBER: aData.at(selItemIdx).PRNUMBER,
                                PRITEMNO: aData.at(selItemIdx).PRITEMNO,
                                MATERIALNO: aData.at(selItemIdx).MATERIALNO,
                                IONUMBER: aData.at(selItemIdx).IONUMBER,
                                QTY: aData.at(selItemIdx).QTY,
                                UNIT: aData.at(selItemIdx).UNIT,
                                VENDOR: aData.at(selItemIdx).VENDOR,
                                PURCHORG: aData.at(selItemIdx).PURCHORG,
                                PURCHPLANT: aData.at(selItemIdx).PURCHPLANT,
                                PURCHGRP: aData.at(selItemIdx).PURCHGRP,
                                REMARKS: ''
                            })

                            this._oLock.push({
                                Prno: aData.at(selItemIdx).PRNUMBER,
                                Prln: aData.at(selItemIdx).PRITEMNO
                            })
                        }
                    })

                    if (oParamData.length > 0) {
                        this.showLoadingDialog('Processing...');
                        
                        var bProceed = await this.lock(this);
                        if (!bProceed) return;

                        this._selectedRecs = 

                        oParam['N_ChangePRParam'] = oParamData;
                        oParam['N_ChangePRReturn'] = [];

                        oModel.create("/ChangePRSet", oParam, {
                            method: "POST",
                            success: function(oResultCPR, oResponse) {
                                me.closeLoadingDialog();

                                if (oResultCPR.N_ChangePRReturn.results.length > 0) {
                                    me._oAssignVendorData.forEach(item => {
                                        var oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER);

                                        if (oRetMsg.length > 0) {
                                            item.REMARKS = oRetMsg[0].Message;
                                        }
                                        else {
                                            item.REMARKS = 'No return message on PR change.';
                                        }

                                        me._refresh = true;
                                    })
                                }
    
                                me.showAssignVendorResult("unassign");
                            },
                            error: function() {
                                // alert("Error");
                            }
                        });
                    }
                    else {
                        sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_VENDOR"]);
                    }
                }
                else {
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_SEL_RECORD_TO_PROC"]);
                }
            },

            refreshTableData: function () {
                this.showLoadingDialog('Loading...');
                this.byId("searchFieldMain").setProperty("value", "");

                var me = this; 
                var oModel = this.getOwnerComponent().getModel();
                var aSmartFilter = this._oCurrentFilter;
                // var oSmartFilter = this.getView().byId("smartFilterBar").getFilters();

                // if (oSmartFilter.length > 0) {
                //     var aFilters = oSmartFilter[0].aFilters;

                //     if (aFilters.length === 1) {
                //         if (aFilters[0].sPath === 'VENDOR') {
                //             if (!isNaN(aFilters[0].oValue1)) {
                //                 while (aFilters[0].oValue1.length < 10) aFilters[0].oValue1 = "0" + aFilters[0].oValue1;
                //             }
                //         }
                //     }
                //     else {
                //         aFilters.forEach(item => {
                //             if (item.aFilters[0].sPath === 'VENDOR') {
                //                 if (!isNaN(item.aFilters[0].oValue1)) {
                //                     while (item.aFilters[0].oValue1.length < 10) item.aFilters[0].oValue1 = "0" + item.aFilters[0].oValue1;
                //                 }
                //             }
                //         })
                //     }
                // }

                //get styles data for the table
                var oJSONDataModel = new JSONModel(); 

                oModel.read("/MainSet", {
                    filters: aSmartFilter,
                    success: function (oData, oResponse) {
                        var vUnassigned = 0, vPartial = 0;

                        oData.results.forEach((item, index) => {
                            if (item.VENDOR === '') vUnassigned++;
                            if (item.QTY !== item.ORDEREDQTY && +item.ORDEREDQTY > 0) vPartial++;
                            item.DELVDATE = dateFormat.format(item.DELVDATE);
                            item.RECID = item.PRNUMBER + item.PRITEMNO;
                        })

                        oData.results.sort((a,b) => (a.RECID < b.RECID ? 1 : -1));

                        oData.results.forEach((item, index) => {
                            if (me._selectedRecs.length === 0) {
                                if (index === 0) item.ACTIVE = "X";
                                else item.ACTIVE = "";
                            }
                            else { item.ACTIVE = ""; }
                        })

                        me._counts.total = oData.results.length;
                        me._counts.unassigned = vUnassigned;
                        me._counts.partial = vPartial;
                        me.getView().getModel("counts").setData(me._counts);

                        oJSONDataModel.setData(oData);
                        me.getView().setModel(oJSONDataModel, "mainData");
                        me.closeLoadingDialog();
                        // me.setTableData();
                        // me.applyColFilter();

                        me.byId("mainTab").getModel().setProperty("/rows", oData.results);
                        me.byId("mainTab").bindRows("/rows");

                        // if (me.getOwnerComponent().getModel("COLUMN_FILTER_MODEL").getData().items.length > 0) me.setColumnFilters("mainTab");
                        if (me.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").getData().items.length > 0) me.setColumnSorters("mainTab");
                        TableFilter.applyColFilters(me);

                        setTimeout(() => {
                            if (me._selectedRecs.length > 0) {
                                me.setSelectedRows();
                            }
                        }, 500);
                    },
                    error: function (err) { }
                });

            },

            setSelectedRows() {
                var bActive = false;

                this.byId("mainTab").getModel().getData().rows.forEach((item, index) => {
                    item.ACTIVE = "";
                    // console.log(item.PRNUMBER, item.PRITEMNO)
                    if (this._selectedRecs.filter(fItem => fItem.PRNUMBER === item.PRNUMBER && fItem.PRITEMNO === item.PRITEMNO).length > 0) {
                        // console.log(this._selectedRecs);
                        // console.log(this.byId("mainTab").getBinding("rows").aIndices)
                        this.byId("mainTab").getBinding("rows").aIndices.forEach((item2, index2) => {
                            // console.log(index, index2)
                            if (item2 === index) {
                                this.byId("mainTab").addSelectionInterval(index2, index2);

                                if (!bActive) {
                                    item.ACTIVE = "X";
                                    bActive = true;
                                }
                            }
                        })
                    }
                })

                this._selectedRecs = [];
            },

            onSaveTableLayout: function () {
                //saving of the layout of table
                var me = this;
                var ctr = 1;
                var oTable = this.getView().byId("mainTab");
                var oColumns = oTable.getColumns();
                var vSBU = this.getView().getModel("ui").getData().sbu;

                var oParam = {
                    "SBU": vSBU,
                    "TYPE": "APROCESS",
                    "TABNAME": "ZDV_3DERP_ANP",
                    "TableLayoutToItems": []
                };
                
                //get information of columns, add to payload
                oColumns.forEach((column) => {
                    oParam.TableLayoutToItems.push({
                        COLUMNNAME: column.sId,
                        ORDER: ctr.toString(),
                        SORTED: column.mProperties.sorted,
                        SORTORDER: column.mProperties.sortOrder,
                        SORTSEQ: "1",
                        VISIBLE: column.mProperties.visible,
                        WIDTH: column.mProperties.width.replace('px',''),
                        WRAPTEXT: this.getView().getModel("ui").getData().dataWrap["mainTab"] === true ? "X" : ""
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

            onCreatePO: async function(oEvent) {
                var me = this;
                var oTable = this.byId("mainTab");
                var oSelectedIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var aData = oTable.getModel().getData().rows;
                var oParamData = [];
                var oParam = {};
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var vSBU = this.getView().getModel("ui").getData().sbu;
                var sVendor = "", sPurchOrg = "", sPurchGrp = "", sPurchPlant = "";
                var bProceed = true;

                this._oCreateData = [];
                this._oLock = [];
                
                if (oSelectedIndices.length > 0) {
                    oSelectedIndices.forEach(item => {
                        oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                    })

                    oSelectedIndices = oTmpSelectedIndices;

                    oSelectedIndices.forEach(item => {
                        sVendor = aData.at(item).VENDOR;
                        sPurchOrg = aData.at(item).PURCHORG;
                        sPurchGrp = aData.at(item).PURCHGRP;
                        sPurchPlant = aData.at(item).PURCHPLANT;

                        if (sVendor === "" || sPurchOrg === "" || sPurchGrp === "" || sPurchPlant === "") {
                            bProceed = false;
                        }
                        else {
                            this._oLock.push({
                                Prno: aData.at(item).PRNUMBER,
                                Prln: aData.at(item).PRITEMNO
                            })

                            this._oCreateData.push({
                                PRNUMBER: aData.at(item).PRNUMBER,
                                PRITEMNO: aData.at(item).PRITEMNO,
                                MATERIALNO: aData.at(item).MATERIALNO,
                                IONUMBER: aData.at(item).IONUMBER,
                                QTY: aData.at(item).QTY,
                                UNIT: aData.at(item).UNIT,
                                VENDOR: aData.at(item).VENDOR,
                                VENDORNAME: aData.at(item).VENDORNAME,
                                PURCHORG: aData.at(item).PURCHORG,
                                PURCHPLANT: aData.at(item).PURCHPLANT,
                                PURCHGRP: aData.at(item).PURCHGRP,
                                COMPANY: aData.at(item).COMPANY,
                                DOCTYPE: aData.at(item).DOCTYPE,
                                MATERIALGRP: aData.at(item).MATERIALGRP,
                                MATERIALTYPE: aData.at(item).MATERIALTYPE,
                                CUSTGRP: aData.at(item).CUSTGRP,
                                SHIPTOPLANT: aData.at(item).SHIPTOPLANT,
                                GMCDESCEN: aData.at(item).GMCDESCEN,
                                ADDTLDESC: aData.at(item).ADDTLDESC,
                                POADDTLDESC: "",
                                DELVDATE: aData.at(item).DELVDATE,
                                BASEPOQTY: (+aData.at(item).QTY) - (+aData.at(item).ORDEREDQTY), //aData.at(item).QTY,
                                ORDERPOQTY: (+aData.at(item).QTY) - (+aData.at(item).ORDEREDQTY),
                                SUPPLYTYPE: aData.at(item).SUPPLYTYPE,
                                ORDERQTY: aData.at(item).ORDEREDQTY,
                                BASEQTY: aData.at(item).QTY,
                                BASEUOM: aData.at(item).UNIT,
                                PLANMONTH: aData.at(item).PLANMONTH,
                                ITEM: '00000',
                                REMARKS: '',
                                INFORECCHECK: false,
                                INFOREC: "",
                                ANDEC: aData.at(item).ANDEC,
                                GRBASEDIV: false,
                                CHECK: false,
                                MRPSUPTYP: ""
                            })
                        }
                    })

                    if (bProceed) {
                        this.showLoadingDialog('Processing...');
                        bProceed = true;

                        var bProceed = await this.lock(this);
                        if (!bProceed) return;
                        
                        this._oModel.read("/ZERPCheckSet", {
                            urlParameters: {
                                "$filter": "Sbu eq '" + vSBU + "' and Field1 eq 'INFORECORD'"
                            },
                            success: function (oDataCheck, oResponse) {
                                oDataCheck.results.forEach(chk => {
                                    me._oCreateData.filter(fItem => fItem.MATERIALTYPE === chk.Field2).forEach(item => item.CHECK = true);
                                })

                                oSelectedIndices.forEach(item => {
                                    if (oDataCheck.results.length > 0) {
                                        if (oDataCheck.results.filter(fItem => fItem.Field2 === aData.at(item).MATERIALTYPE).length === 0) {
                                            oParamData.push({
                                                Vendor: aData.at(item).VENDOR,
                                                Material: aData.at(item).MATERIALNO,
                                                PurchOrg: aData.at(item).PURCHORG,
                                                PurGroup: '', //aData.at(item).PURCHGRP,
                                                Plant: '' //aData.at(item).PURCHPLANT
                                            })
                                        }
                                    }
                                    else {
                                        oParamData.push({
                                            Vendor: aData.at(item).VENDOR,
                                            Material: aData.at(item).MATERIALNO,
                                            PurchOrg: aData.at(item).PURCHORG,
                                            PurGroup: '', //aData.at(item).PURCHGRP,
                                            Plant: '' //aData.at(item).PURCHPLANT
                                        })
                                    }
                                })

                                if (oParamData.length > 0) {
                                    //get valid info record
                                    oParamData = oParamData.filter((value, index, self) => self.findIndex(item => item.Vendor === value.Vendor && item.Material === value.Material && item.PurchOrg === value.PurchOrg) === index) ;
            
                                    oParam['N_GetInfoRecMatParam'] = oParamData;
                                    oParam['N_GetInfoRecReturn'] = [];

                                    oModel.create("/GetInfoRecordSet", oParam, {
                                        method: "POST",
                                        success: function(oResult, oResponse) {
                                            oParamData.forEach(item => {
                                                var returnData = jQuery.extend(true, [], oResult.N_GetInfoRecReturn.results);

                                                returnData = returnData.filter(fItem => fItem.Vendor === item.Vendor && fItem.PurchOrg === item.PurchOrg && fItem.Material === item.Material);

                                                me._oCreateData.filter(fItem => fItem.VENDOR === item.Vendor && fItem.PURCHORG === item.PurchOrg && fItem.MATERIALNO === item.Material)
                                                    .forEach(itemIR => {
                                                        itemIR.INFORECCHECK = true;

                                                        if (returnData.length === 0) {
                                                            itemIR.REMARKS = 'No matching info record retrieve.'
                                                        }
                                                        else {
                                                            itemIR.REMARKS = returnData[0].RetType === 'E' ? returnData[0].RetMessage : '';
                                                            itemIR.UOM = returnData[0].PoUnit;
                                                            itemIR.GROSSPRICE = returnData[0].NetPrice;
                                                            itemIR.NETPRICE = returnData[0].NetPrice;
                                                            itemIR.PER = returnData[0].PriceUnit;
                                                            itemIR.ORDERPRICEUNIT = returnData[0].OrderprUn;
                                                            itemIR.OVERDELTOL = returnData[0].Overdeltol;
                                                            itemIR.UNDERDELTOL = returnData[0].UnderTol;
                                                            itemIR.UNLI = returnData[0].Unlimited;
                                                            itemIR.TAXCODE = returnData[0].TaxCode;
                                                            itemIR.GRBASEDIV = returnData[0].Grbasediv;
                                                            itemIR.ORDERCONVFACTOR = returnData[0].ConvNum1;
                                                            itemIR.BASECONVFACTOR = returnData[0].ConvDen1;
                                                            itemIR.INFOREC = returnData[0].InfoRec;

                                                            var oDecPlaces = me.getView().getModel("uom").getData().filter(fItem => fItem.MSEHI === returnData[0].PoUnit);

                                                            itemIR.ORDERUOMANDEC = oDecPlaces.length > 0 ? oDecPlaces[0].ANDEC : 0;

                                                            var vComputedPOQty = itemIR.BASEPOQTY / ((+returnData[0].ConvNum1) * (+returnData[0].ConvDen1) * (+returnData[0].PriceUnit));
                                                            var vFinalPOQty = "0";

                                                            if (itemIR.ORDERUOMANDEC === 0) vFinalPOQty = Math.ceil(vComputedPOQty).toString();
                                                            else vFinalPOQty = vComputedPOQty.toFixed(itemIR.ORDERUOMANDEC);

                                                            // itemIR.BASEPOQTY = vFinalPOQty;
                                                            itemIR.ORDERPOQTY = vFinalPOQty;
                                                        }
                                                    });
                                            })

                                            oParamData = [];

                                            if (me._oCreateData.filter(fItem => fItem.REMARKS === '').length > 0) {
                                                //Check PO doc type for PR items with valid info records
                                                me._oModel.read("/PODocTypSet", {
                                                    success: function (oDataPODocTyp, oResponse) {
                                                        me._oCreateData.filter(fItem => fItem.REMARKS === '').forEach(item => {
                                                            var returnData = jQuery.extend(true, [], oDataPODocTyp.results);

                                                            returnData = returnData.filter(fItem => fItem.SBU === vSBU);

                                                            if (item.COMPANY !== '') returnData = returnData.filter(fItem => fItem.COMPANYCD === item.COMPANY);
                                                            if (item.DOCTYPE !== '') returnData = returnData.filter(fItem => fItem.PRDOCTYP === item.DOCTYPE);
                                                            if (item.MATERIALGRP !== '') returnData = returnData.filter(fItem => fItem.MATGRPCD === item.MATERIALGRP);
                                                            // if (item.MATERIALTYPE !== '') returnData = returnData.filter(fItem => fItem.MATTYP === item.MATERIALTYPE);
                                                            // if (item.CUSTGRP !== '') returnData = returnData.filter(fItem => fItem.CUSTGRP === item.CUSTGRP);
                                                            if (item.SHIPTOPLANT !== '') returnData = returnData.filter(fItem => fItem.PLANTCD === item.SHIPTOPLANT);

                                                            if (returnData.length === 0) {
                                                                item.REMARKS = 'No PO doc type retrieve.';
                                                            }
                                                            else {
                                                                item.DOCTYPE = returnData[0].PODOCTYP;

                                                                var oCompany = me.getView().getModel("company").getData().filter(fItem => fItem.BUKRS === item.COMPANY);
                                                                var oPurchPlant = me.getView().getModel("plant").getData().filter(fItem => fItem.WERKS === item.PURCHPLANT);
                                                                var oShipPlant = me.getView().getModel("plant").getData().filter(fItem => fItem.WERKS === item.SHIPTOPLANT);
                                                                var oPurchOrg = me.getView().getModel("purchorg").getData().filter(fItem => fItem.PURCHORG === item.PURCHORG);
                                                                var oPurchGrp = me.getView().getModel("purchgrp").getData().filter(fItem => fItem.PURCHGRP === item.PURCHGRP);

                                                                oParamData.push({
                                                                    DOCTYPE: returnData[0].PODOCTYP,
                                                                    DOCTYPEDESC: returnData[0].SHORTTEXT + " (" + returnData[0].PODOCTYP + ")",
                                                                    VENDOR: item.VENDOR,
                                                                    VENDORNAME: item.VENDORNAME,
                                                                    CUSTGRP: item.CUSTGRP,
                                                                    PURCHORG: item.PURCHORG,
                                                                    PURCHORGDESC: oPurchOrg.length > 0 ? oPurchOrg[0].DESCRIPTION + " (" + item.PURCHORG + ")" : item.PURCHORG,
                                                                    PURCHGRP: item.PURCHGRP,
                                                                    PURCHGRPDESC: oPurchGrp.length > 0 ? oPurchGrp[0].DESCRIPTION + " (" + item.PURCHGRP + ")" : item.PURCHGRP,
                                                                    COMPANY: item.COMPANY,
                                                                    COMPANYDESC: oCompany.length > 0 ? oCompany[0].BUTXT + " (" + item.COMPANY + ")" : item.COMPANY,
                                                                    PURCHPLANT: item.PURCHPLANT,
                                                                    PURCHPLANTDESC: oPurchPlant.length > 0 ? oPurchPlant[0].NAME1 + " (" + item.PURCHPLANT + ")" : item.PURCHPLANT,
                                                                    SHIPTOPLANT: item.SHIPTOPLANT,
                                                                    SHIPTOPLANTDESC: oShipPlant.length > 0 ? oShipPlant[0].NAME1 + " (" + item.SHIPTOPLANT + ")" : item.SHIPTOPLANT
                                                                })
                                                            }
                                                        })

                                                        if (me._oCreateData.filter(fItem => fItem.REMARKS === '').length > 0) {
                                                            //check record with no need for inforec, get in ZERP_MRPDATA
                                                            var iCtr = 0;
                                                            var aNOIR = me._oCreateData.filter(fItem => fItem.REMARKS === '' && !fItem.INFORECCHECK);
                                                            if (aNOIR.length == 0) {
                                                                me.closeLoadingDialog();
                                                                me.createPO(oParamData);
                                                            }
                                                            else {
                                                                aNOIR.forEach(noir => {
                                                                    var sVendor = noir.VENDOR;
                                                                    if (!isNaN(sVendor)) {
                                                                        while (sVendor.length < 10) sVendor = "0" + sVendor;
                                                                    }

                                                                    me._oModel.read("/MRPDataSet", {
                                                                        urlParameters: {
                                                                            "$filter": "Iono eq '" + noir.IONUMBER + "' and Matno eq '" + noir.MATERIALNO + "' and Vendor eq '" + sVendor + "' and Purchorg eq '" + noir.PURCHORG + "'"
                                                                        },
                                                                        success: function (oDataNOIR) {
                                                                            iCtr++;
                                                                            noir.PER = "1";

                                                                            if (oDataNOIR.results.length > 0) {
                                                                                noir.ORDERCONVFACTOR = oDataNOIR.results[0].Umren;
                                                                                noir.BASECONVFACTOR = oDataNOIR.results[0].Umrez;
                                                                                noir.UOM = oDataNOIR.results[0].Orderuom;
                                                                                noir.GROSSPRICE = oDataNOIR.results[0].Unitprice;
                                                                                noir.NETPRICE = oDataNOIR.results[0].Netprice;
                                                                                noir.ORDERPRICEUNIT = oDataNOIR.results[0].Orderuom;
                                                                                noir.TAXCODE = oDataNOIR.results[0].Taxcode;
                                                                                noir.OVERDELTOL = oDataNOIR.results[0].Uebto;
                                                                                noir.UNDERDELTOL = oDataNOIR.results[0].Untto;
                                                                                noir.UNLI = oDataNOIR.results[0].Uebtk === "X" ? true : false;

                                                                                var oDecPlaces = me.getView().getModel("uom").getData().filter(fItem => fItem.MSEHI === oDataNOIR.results[0].Orderuom);

                                                                                noir.ORDERUOMANDEC = oDecPlaces.length > 0 ? oDecPlaces[0].ANDEC : 0;

                                                                                var vFinalPOQty = "0";

                                                                                if (noir.ORDERUOMANDEC === 0) vFinalPOQty = Math.ceil(noir.ORDERPOQTY).toString();
                                                                                else vFinalPOQty = noir.ORDERPOQTY.toFixed(noir.ORDERUOMANDEC);
                    
                                                                                // itemIR.BASEPOQTY = vFinalPOQty;
                                                                                noir.ORDERPOQTY = vFinalPOQty;
                                                                            }
                                                                            else {
                                                                                noir.ORDERCONVFACTOR = "1";
                                                                                noir.BASECONVFACTOR = "1";
                                                                            }

                                                                            if (aNOIR.length === iCtr) {
                                                                                me.closeLoadingDialog();
                                                                                me.createPO(oParamData);
                                                                            }
                                                                        },
                                                                        error: function(err) {
                                                                            iCtr++;

                                                                            if (aNOIR.length === iCtr) {
                                                                                me.closeLoadingDialog();
                                                                                me.createPO(oParamData);
                                                                            }
                                                                        }
                                                                    })
                                                                })
                                                            }
                                                        }
                                                        else {
                                                            me.closeLoadingDialog();
                                                            me.showCreatePOResult();
                                                        }
                                                    },
                                                    error: function (err) { }
                                                });
                                            }
                                            else {
                                                me.closeLoadingDialog();
                                                me.showCreatePOResult();
                                            }
                                        },
                                        error: function() {
                                            me.closeLoadingDialog();
                                        }
                                    }); 
                                }
                                else if (me._oCreateData.length > 0) {
                                    //check po doc type
                                    me._oModel.read("/PODocTypSet", {
                                        success: function (oDataPODocTyp, oResponse) {
                                            me._oCreateData.filter(fItem => fItem.REMARKS === '').forEach(item => {
                                                var returnData = jQuery.extend(true, [], oDataPODocTyp.results);

                                                returnData = returnData.filter(fItem => fItem.SBU === vSBU);

                                                if (item.COMPANY !== '') returnData = returnData.filter(fItem => fItem.COMPANYCD === item.COMPANY);
                                                if (item.DOCTYPE !== '') returnData = returnData.filter(fItem => fItem.PRDOCTYP === item.DOCTYPE);
                                                if (item.MATERIALGRP !== '') returnData = returnData.filter(fItem => fItem.MATGRPCD === item.MATERIALGRP);
                                                // if (item.MATERIALTYPE !== '') returnData = returnData.filter(fItem => fItem.MATTYP === item.MATERIALTYPE);
                                                // if (item.CUSTGRP !== '') returnData = returnData.filter(fItem => fItem.CUSTGRP === item.CUSTGRP);
                                                if (item.SHIPTOPLANT !== '') returnData = returnData.filter(fItem => fItem.PLANTCD === item.SHIPTOPLANT);

                                                if (returnData.length === 0) {
                                                    item.REMARKS = 'No PO doc type retrieve.';
                                                }
                                                else {
                                                    item.DOCTYPE = returnData[0].PODOCTYP;

                                                    var oCompany = me.getView().getModel("company").getData().filter(fItem => fItem.BUKRS === item.COMPANY);
                                                    var oPurchPlant = me.getView().getModel("plant").getData().filter(fItem => fItem.WERKS === item.PURCHPLANT);
                                                    var oShipPlant = me.getView().getModel("plant").getData().filter(fItem => fItem.WERKS === item.SHIPTOPLANT);
                                                    var oPurchOrg = me.getView().getModel("purchorg").getData().filter(fItem => fItem.PURCHORG === item.PURCHORG);
                                                    var oPurchGrp = me.getView().getModel("purchgrp").getData().filter(fItem => fItem.PURCHGRP === item.PURCHGRP);

                                                    oParamData.push({
                                                        DOCTYPE: returnData[0].PODOCTYP,
                                                        DOCTYPEDESC: returnData[0].SHORTTEXT + " (" + returnData[0].PODOCTYP + ")",
                                                        VENDOR: item.VENDOR,
                                                        VENDORNAME: item.VENDORNAME,
                                                        CUSTGRP: item.CUSTGRP,
                                                        PURCHORG: item.PURCHORG,
                                                        PURCHORGDESC: oPurchOrg.length > 0 ? oPurchOrg[0].DESCRIPTION + " (" + item.PURCHORG + ")" : item.PURCHORG,
                                                        PURCHGRP: item.PURCHGRP,
                                                        PURCHGRPDESC: oPurchGrp.length > 0 ? oPurchGrp[0].DESCRIPTION + " (" + item.PURCHGRP + ")" : item.PURCHGRP,
                                                        COMPANY: item.COMPANY,
                                                        COMPANYDESC: oCompany.length > 0 ? oCompany[0].BUTXT + " (" + item.COMPANY + ")" : item.COMPANY,
                                                        PURCHPLANT: item.PURCHPLANT,
                                                        PURCHPLANTDESC: oPurchPlant.length > 0 ? oPurchPlant[0].NAME1 + " (" + item.PURCHPLANT + ")" : item.PURCHPLANT,
                                                        SHIPTOPLANT: item.SHIPTOPLANT,
                                                        SHIPTOPLANTDESC: oShipPlant.length > 0 ? oShipPlant[0].NAME1 + " (" + item.SHIPTOPLANT + ")" : item.SHIPTOPLANT
                                                    })
                                                }
                                            })

                                            if (me._oCreateData.filter(fItem => fItem.REMARKS === '').length > 0) {
                                                var iCtr = 0;
                                                var aNOIR = me._oCreateData.filter(fItem => fItem.REMARKS === '');

                                                aNOIR.forEach(noir => {
                                                    var sVendor = noir.VENDOR;
                                                    if (!isNaN(sVendor)) {
                                                        while (sVendor.length < 10) sVendor = "0" + sVendor;
                                                    }

                                                    me._oModel.read("/MRPDataSet", {
                                                        urlParameters: {
                                                            "$filter": "Iono eq '" + noir.IONUMBER + "' and Matno eq '" + noir.MATERIALNO + "' and Vendor eq '" + sVendor + "' and Purchorg eq '" + noir.PURCHORG + "'"
                                                        },
                                                        success: function (oDataNOIR) {
                                                            iCtr++;
                                                            noir.PER = "1";

                                                            if (oDataNOIR.results.length > 0) {
                                                                noir.ORDERCONVFACTOR = oDataNOIR.results[0].Umren;
                                                                noir.BASECONVFACTOR = oDataNOIR.results[0].Umrez;
                                                                noir.UOM = oDataNOIR.results[0].Orderuom;
                                                                noir.GROSSPRICE = oDataNOIR.results[0].Unitprice;
                                                                noir.NETPRICE = oDataNOIR.results[0].Netprice;
                                                                noir.ORDERPRICEUNIT = oDataNOIR.results[0].Orderuom;
                                                                noir.TAXCODE = oDataNOIR.results[0].Taxcode;
                                                                noir.OVERDELTOL = oDataNOIR.results[0].Uebto;
                                                                noir.UNDERDELTOL = oDataNOIR.results[0].Untto;
                                                                noir.UNLI = oDataNOIR.results[0].Uebtk === "X" ? true : false;

                                                                var oDecPlaces = me.getView().getModel("uom").getData().filter(fItem => fItem.MSEHI === oDataNOIR.results[0].Orderuom);

                                                                noir.ORDERUOMANDEC = oDecPlaces.length > 0 ? oDecPlaces[0].ANDEC : 0;

                                                                var vFinalPOQty = "0";

                                                                if (noir.ORDERUOMANDEC === 0) vFinalPOQty = Math.ceil(noir.ORDERPOQTY).toString();
                                                                else vFinalPOQty = noir.ORDERPOQTY.toFixed(noir.ORDERUOMANDEC);
    
                                                                // itemIR.BASEPOQTY = vFinalPOQty;
                                                                noir.ORDERPOQTY = vFinalPOQty;
                                                                noir.MRPSUPTYP = oDataNOIR.results[0].Supplytyp;

                                                                if (oDataNOIR.results[0].Supplytyp !== "NOM") {
                                                                    if (oDataNOIR.results[0].Orderuom === "") { 
                                                                        noir.UOM = noir.BASEUOM;
                                                                        noir.ORDERPRICEUNIT = noir.BASEUOM;
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                noir.ORDERCONVFACTOR = "1";
                                                                noir.BASECONVFACTOR = "1";
                                                            }

                                                            if (aNOIR.length === iCtr) {
                                                                me.closeLoadingDialog();
                                                                me.createPO(oParamData);
                                                            }
                                                        },
                                                        error: function(err) {
                                                            iCtr++;

                                                            if (aNOIR.length === iCtr) {
                                                                me.closeLoadingDialog();
                                                                me.createPO(oParamData);
                                                            }
                                                        }
                                                    })
                                                })
                                            }
                                            else {
                                                me.closeLoadingDialog();
                                                me.showCreatePOResult();
                                            }
                                        },
                                        error: function (err) { }
                                    });
                                }
                                else if (me._oCreateData.length === 0) {
                                    me.closeLoadingDialog();
                                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_RECORD_TO_PROC"]);
                                    me.unLock();
                                }
                            },
                            error: function (err) {
                                me.closeLoadingDialog();
                                sap.m.MessageBox.information(err);
                                me.unLock();
                            }
                        });
                    }
                    else {
                        sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_CREATEPO_VALIDATION"])
                    }
                }
                else {
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_SEL_RECORD_TO_PROC"]);
                }
            },

            createPO(arg) {
                var oParamData = arg;
                var oCreatePOHdr = oParamData.filter((value, index, self) => self.findIndex(item => item.DOCTYPE === value.DOCTYPE && item.VENDOR === value.VENDOR && item.PURCHORG === value.PURCHORG && item.PURCHGRP === value.PURCHGRP && item.COMPANY === value.COMPANY && item.PURCHPLANT === value.PURCHPLANT && item.SHIPTOPLANT === value.SHIPTOPLANT && item.VENDORNAME === value.VENDORNAME) === index) ;
                var oCreatePODtls = this._oCreateData.filter(fItem => fItem.REMARKS === '');
                var me = this;
                this._oLock = [];  
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var counter = 0;

                //Add GROUP key and extend indicator
                oCreatePOHdr.forEach((item, index) => {
                    item.GROUP = (index + 1) + "";
                    item.EXTEND = false;
                    item.PONO = "";

                    oCreatePODtls.filter(fItem => fItem.DOCTYPE === item.DOCTYPE && fItem.VENDOR === item.VENDOR && fItem.PURCHORG === item.PURCHORG && fItem.PURCHGRP === item.PURCHGRP && fItem.COMPANY === item.COMPANY && fItem.PURCHPLANT === item.PURCHPLANT && fItem.SHIPTOPLANT === item.SHIPTOPLANT)
                        .forEach((rItem, rIndex) => { 
                            rItem.GROUP = (index + 1) + "";

                            var sItem = (10 * ( rIndex + 1 )) + "";
                            while (sItem.length < 5) sItem = "0" + sItem;

                            rItem.ITEM = sItem;

                            this._oLock.push({
                                Prno: rItem.PRNUMBER,
                                Prln: rItem.PRITEMNO
                            })
                        });
                });
                
                oCreatePODtls.forEach(item => {
                    var sVendor = item.VENDOR;

                    if (!isNaN(sVendor)) {
                        while (sVendor.length < 10) sVendor = "0" + sVendor;
                    }

                    var oParam = {
                        IV_DOCTYPE: item.DOCTYPE,
                        IV_VENDOR: sVendor,
                        IV_PRNUMBER: item.PRNUMBER,
                        IV_PRITEM: item.PRITEMNO,
                        IV_POQTY: item.ORDERPOQTY + ""
                    }

                    setTimeout(() => {
                        oModel.create("/Get_POTolSet", oParam, {
                            method: "POST",
                            success: function(oData, oResponse) {
                                counter++;

                                if ((oData.RETURN + "") !== "4") {       
                                    item.OVERDELTOL = (+oData.EV_UEBTO).toFixed(1);
                                    item.UNDERDELTOL = (+oData.EV_UNTTO).toFixed(1);
                                    item.UNLI = oData.EV_UNLI === "" ? false : true;
                                    item.WITHPOTOL = true;
                                }
                                else { item.WITHPOTOL = false; }

                                if (counter === oCreatePODtls.length) {
                                    me.validateExtendPO(oCreatePOHdr, oCreatePODtls);
                                    // me.navToGenPO(oCreatePOHdr, oCreatePODtls);
                                }
                            },
                            error: function (err) { 
                                counter++;
                                if (counter === oCreatePODtls.length) {
                                    me.validateExtendPO(oCreatePOHdr, oCreatePODtls);
                                    // me.navToGenPO(oCreatePOHdr, oCreatePODtls);
                                }
                            }
                        })
                    }, 100); 
                })
            },

            navToGenPO() {
                // var oCreatePOHdr = arg1;
                // var oCreatePODtls = arg2;

                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/sbu", this.getView().getModel("ui").getData().sbu);

                if (this.byId("mainTab").getBinding("rows").aSorters.length > 0) {
                    this._aColSorters = this.byId("mainTab").getBinding("rows").aSorters;
                    this.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").setProperty("/items", this._aColSorters);
                }

                // this.getOwnerComponent().getModel("CREATEPO_MODEL").setData({
                //     header: oCreatePOHdr,
                //     detail: oCreatePODtls
                // })

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteCreatePO");

                //unlock PRs not valid for PO creation
                if (this._oCreateData.filter(fItem => fItem.REMARKS !== '').length > 0) {
                    var oModelLock = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
                    var oParamUnLock = {};
                    var oParamUnLockData = [];  

                    this._oCreateData.filter(fItem => fItem.REMARKS !== '').forEach(item => {
                        oParamUnLockData.push({
                            Prno: item.PRNUMBER,
                            Prln: item.PRITEMNO
                        })
                    })

                    oParamUnLock["N_IMPRTAB"] = oParamUnLockData;
                    oParamUnLock["N_PRUNLOCK_RETURN"] = []; 
    
                    oModelLock.create("/Unlock_PRSet", oParamUnLock, {
                        method: "POST",
                        success: function(oResultLock) { },
                        error: function (err) {
                            me.closeLoadingDialog();
                            sap.m.MessageBox.information(err)
                        }
                    })
                }                
            },

            showCreatePOResult() {
                // display pop-up for user selection
                this.unLock();

                if (!this._CreatePOResultDialog) {
                    this._CreatePOResultDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.CreatePOResultDialog", this);

                    this._CreatePOResultDialog.setModel(
                        new JSONModel({
                            items: this._oCreateData,
                            rowCount: this._oCreateData.length
                        })
                    )

                    this.getView().addDependent(this._CreatePOResultDialog);
                }
                else {
                    this._CreatePOResultDialog.getModel().setProperty("/items", this._oCreateData);
                    this._CreatePOResultDialog.getModel().setProperty("/rowCount", this._oCreateData.length);
                }

                this._CreatePOResultDialog.setTitle("Create PO Result")
                this._CreatePOResultDialog.open();
            },

            onCreatePOResultClose: function(oEvent) {
                this._CreatePOResultDialog.close();
            },

            onCellClick: function(oEvent) {
                if (oEvent.getParameters().rowBindingContext) {
                    var oTable = oEvent.getSource(); //this.byId("ioMatListTab");
                    var sRowPath = oEvent.getParameters().rowBindingContext.sPath;
    
                    oTable.getModel().getData().rows.forEach(row => row.ACTIVE = "");
                    oTable.getModel().setProperty(sRowPath + "/ACTIVE", "X"); 
                    
                    oTable.getRows().forEach(row => {
                        if (row.getBindingContext() && row.getBindingContext().sPath.replace("/rows/", "") === sRowPath.replace("/rows/", "")) {
                            row.addStyleClass("activeRow");
                        }
                        else row.removeStyleClass("activeRow")
                    })
                }
            },
            
            onSort: function(oEvent) {
                this.setActiveRowHighlight();
            },

            onFilter: function(oEvent) {
                this.setActiveRowHighlight();
            },

            onFirstVisibleRowChanged: function (oEvent) {
                var oTable = oEvent.getSource();

                setTimeout(() => {
                    var oData = oTable.getModel().getData().rows;
                    var iStartIndex = oTable.getBinding("rows").iLastStartIndex;
                    var iLength = oTable.getBinding("rows").iLastLength + iStartIndex;

                    if (oTable.getBinding("rows").aIndices.length > 0) {
                        for (var i = iStartIndex; i < iLength; i++) {
                            var iDataIndex = oTable.getBinding("rows").aIndices.filter((fItem, fIndex) => fIndex === i);
    
                            if (oData[iDataIndex].ACTIVE === "X") oTable.getRows()[iStartIndex === 0 ? i : i - iStartIndex].addStyleClass("activeRow");
                            else oTable.getRows()[iStartIndex === 0 ? i : i - iStartIndex].removeStyleClass("activeRow");
                        }
                    }
                    else {
                        for (var i = iStartIndex; i < iLength; i++) {
                            if (oData[i].ACTIVE === "X") oTable.getRows()[iStartIndex === 0 ? i : i - iStartIndex].addStyleClass("activeRow");
                            else oTable.getRows()[iStartIndex === 0 ? i : i - iStartIndex].removeStyleClass("activeRow");
                        }
                    }
                }, 1);
            },

            onColumnUpdated: function (oEvent) {
                this.setActiveRowHighlight();
            },

            onKeyUp(oEvent) {
                if ((oEvent.key === "ArrowUp" || oEvent.key === "ArrowDown") && oEvent.srcControl.sParentAggregationName === "rows") {
                    var oTable = this.byId(oEvent.srcControl.sId).oParent;
                    
                    if (this.byId(oEvent.srcControl.sId).getBindingContext()) {
                        var sRowPath = this.byId(oEvent.srcControl.sId).getBindingContext().sPath;
                    
                        oTable.getModel().getData().rows.forEach(row => row.ACTIVE = "");
                        oTable.getModel().setProperty(sRowPath + "/ACTIVE", "X"); 
                        
                        oTable.getRows().forEach(row => {
                            if (row.getBindingContext() && row.getBindingContext().sPath.replace("/rows/", "") === sRowPath.replace("/rows/", "")) {
                                row.addStyleClass("activeRow");
                            }
                            else row.removeStyleClass("activeRow")
                        })
                    }
                }
            },

            onAfterTableRendering: function(oEvent) {
                if (this._tableRendered !== "") {
                    this.setActiveRowHighlight();
                    this._tableRendered = "";
                } 
            },

            setActiveRowHighlight() {
                var oTable = this.byId("mainTab");
                
                setTimeout(() => {
                    var iActiveRowIndex = oTable.getModel().getData().rows.findIndex(item => item.ACTIVE === "X");

                    oTable.getRows().forEach(row => {
                        if (row.getBindingContext() && +row.getBindingContext().sPath.replace("/rows/", "") === iActiveRowIndex) {
                            row.addStyleClass("activeRow");
                        }
                        else row.removeStyleClass("activeRow");
                    })                    
                }, 1);
            },

            lock: async (me) => {
                var oModelLock = me.getOwnerComponent().getModel("ZGW_3DERP_LOCK2_SRV");
                var oParamLock = {};
                var sError = "";
                
                var promise = new Promise((resolve, reject) => {
                    oParamLock["N_IMPRTAB"] = me._oLock;
                    oParamLock["iv_count"] = 300;
                    oParamLock["N_LOCK_MESSAGES"] = []; 
                    console.log(oParamLock)
                    oModelLock.create("/Lock_PRSet", oParamLock, {
                        method: "POST",
                        success: function(oResultLock) {
                            console.log(oResultLock);
                            oResultLock.N_LOCK_MESSAGES.results.forEach(item => {
                                if (item.Type === "E") {
                                    sError += item.Message + ".\r\n ";
                                }
                            })
                            
                            if (sError.length > 0) {
                                resolve(false);
                                sap.m.MessageBox.information(sError);
                                me.closeLoadingDialog();
                                me.unLock();
                            }
                            else resolve(true);
                        },
                        error: function (err) {
                            me.closeLoadingDialog();
                            resolve(false);
                            me.unLock();
                        }
                    });
                })

                return await promise;
            },

            unLock() {
                if (this._oLock.length > 0) {
                    var oModelLock = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK2_SRV");
                    var oParamUnLock = {}
    
                    oParamUnLock["N_IMPRTAB"] = this._oLock;
                    console.log(oParamUnLock)
                    // setTimeout(() => {
                        oModelLock.create("/Unlock_PRSet", oParamUnLock, {
                            method: "POST",
                            success: function(oResultUnlock) { console.log(oResultUnlock) },
                            error: function (err) { }
                        })
        
                        this._oLock = [];                    
                    // }, 10);
                }
            },

            singlelock: async (me) => {
                var oModelLock = me.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
                // oModelLock.setUseBatch(true);
                var oParamLock = {};
                var sError = "";
                var vCounter = 0;
                
                var promise = new Promise((resolve, reject) => {
                    me._oLock.forEach(item => {
                        setTimeout(() => {
                            var oLockItem = [];
                            oLockItem.push(item);
                            console.log(item)
                            oParamLock["N_IMPRTAB"] = oLockItem; //me._oLock;
                            oParamLock["iv_count"] = 300;
                            oParamLock["N_LOCK_MESSAGES"] = []; 
        
                            oModelLock.create("/Lock_PRSet", oParamLock, {
                                method: "POST",
                                success: function(oResultLock) {
                                    vCounter++;

                                    oResultLock.N_LOCK_MESSAGES.results.forEach(item => {
                                        if (item.Type === "E") {
                                            sError += item.Message + ".\r\n ";
                                        }
                                    })
                                    
                                    if (sError.length > 0) {
                                        if (vCounter === me._oLock.length) {
                                            resolve(false);
                                            me.unLock();
                                            sap.m.MessageBox.information(sError);
                                            me.closeLoadingDialog();
                                        }
                                    }
                                    else {
                                        if (vCounter === me._oLock.length) {
                                            me.closeLoadingDialog();
                                            resolve(true);
                                        }
                                    }
                                },
                                error: function (err) {
                                    vCounter++;
    
                                    if (vCounter === me._oLock.length) {
                                        me.closeLoadingDialog();
                                        me.unLock();
                                        resolve(false);
                                    }
                                }
                            });                            
                        }, 100);
                    })
                })

                return await promise;
            },

            singleunLock() {
                var oModelLock = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
                var oParamUnLock = {};
                var me = this;
                var vCounter = 0;

                this._oLock.forEach(item => { 
                    setTimeout(() => {
                        var oLockItem = [];
                        oLockItem.push(item);
    
                        oParamUnLock["N_IMPRTAB"] = oLockItem;
                        oModelLock.create("/Unlock_PRSet", oParamUnLock, {
                            method: "POST",
                            success: function(oResultLock) { },
                            error: function (err) { }
                        })
                    }, 10);
                })

                this._oLock = [];
            },

            batchlock: async (me) => {
                me._lockCounter = 0;
                me._lockError = "";
                me._lockResult = false;
                me._lockFinish = false;
                me.looplock(0);
                
                var promise = new Promise((resolve, reject) => {
                    var lockInterval = setInterval(() => {
                        if (me._lockFinish) {
                            resolve(me._lockResult);
                            clearInterval(lockInterval);
                        }                        
                    }, 500);
                })

                return await promise;
            },

            looplock(iCounter) {
                var me = this;
                var oModelLock = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
                var oParamLock = {};

                setTimeout(() => {
                    console.log(new Date());
                    var oLockItem = [];
                    oLockItem.push(me._oLock[iCounter]);
                    
                    oParamLock["N_IMPRTAB"] = oLockItem;
                    oParamLock["iv_count"] = 300;
                    oParamLock["N_LOCK_MESSAGES"] = []; 

                    oModelLock.create("/Lock_PRSet", oParamLock, {
                        method: "POST",
                        success: function(oResultLock) {
                            me._lockCounter++;
                            console.log(me._lockCounter, me._oLock.length, oResultLock);

                            oResultLock.N_LOCK_MESSAGES.results.forEach(item => {
                                if (item.Type === "E") {
                                    me._lockError += item.Message + ".\r\n ";
                                }
                            })
                            
                            if (me._lockError.length > 0) {
                                if (me._lockCounter === me._oLock.length) {
                                    me._lockResult = false;
                                    me._lockFinish = true;
                                    me.unLock();
                                    sap.m.MessageBox.information(me._lockError);
                                    me.closeLoadingDialog();
                                }
                            }
                            else {
                                if (me._lockCounter === me._oLock.length) {
                                    me.closeLoadingDialog();
                                    me._lockResult = true;
                                    me._lockFinish = true;
                                }
                            }
                        },
                        error: function (err) {
                            me._lockCounter++;
                            me._lockError += oLockItem[0].Prno + oLockItem[0].Prln + " " + err.message + ".\r\n ";
                            console.log(err)
                            if (me._lockCounter === me._oLock.length) {
                                me.closeLoadingDialog();
                                me.unLock();
                                me._lockResult = false;
                                me._lockFinish = true;
                                sap.m.MessageBox.information(me._lockError);
                            }
                        }
                    });                    

                    iCounter++;

                    if (iCounter !== me._oLock.length) {
                        me.looplock(iCounter);
                    }
                }, 5000);
            },

            // batchlock: async (me) => {
            //     var oModelLock = me.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
            //     var iCounter = 0;
            //     var sError = "";
            //     var mParameters = { groupId:"update" };

            //     oModelLock.setUseBatch(true);
            //     oModelLock.setDeferredGroups(["update"]);                
                
            //     var promise = new Promise((resolve, reject) => {
            //         me._oLock.forEach(item => {
            //             setTimeout(() => {
            //                 console.log(new Date());
            //                 var oParamLock = {};     
            //                 var oLockItem = [];

            //                 oLockItem.push(item);
            //                 oParamLock["N_IMPRTAB"] = oLockItem; //me._oLock;
            //                 oParamLock["iv_count"] = 300;
            //                 oParamLock["N_LOCK_MESSAGES"] = []; 
            //                 console.log(oLockItem)
            //                 oModelLock.create("/Lock_PRSet", oParamLock, mParameters);

            //                 oModelLock.submitChanges({
            //                     groupId: "update",
            //                     success: function (oResultLock, oResponse) {
            //                         console.log(oResultLock);
            //                         console.log(oResponse)
            //                         iCounter++;

            //                         if (oResultLock.__batchResponses[0].__changeResponses[0].data.N_LOCK_MESSAGES.results.length !== 0) {                                        
            //                             if (oResultLock.__batchResponses[0].__changeResponses[0].data.N_LOCK_MESSAGES.results[0].Type === "E") {
            //                                 sError += oResultLock.__batchResponses[0].__changeResponses[0].data.N_LOCK_MESSAGES.results[0].Message + ".\r\n ";
            //                             }
            //                         }
                                        
            //                         if (sError.length > 0) {
            //                             if (iCounter === me._oLock.length) {
            //                                 resolve(false);
            //                                 me.unLock();
            //                                 sap.m.MessageBox.information(sError);
            //                                 me.closeLoadingDialog();
            //                             }
            //                         }
            //                         else {
            //                             if (iCounter === me._oLock.length) {
            //                                 me.closeLoadingDialog();
            //                                 resolve(true);
            //                             }
            //                         }
            //                     },
            //                     error: function (error) {
            //                         iCounter++;
            //                         sError += oLockItem[0].Prno + oLockItem[0].Prln + ":" + error.message + ".\r\n ";

            //                         if (iCounter === me._oLock.length) {
            //                             me.closeLoadingDialog();
            //                             resolve(false);
            //                             me.unLock();
            //                             sap.m.MessageBox.information(sError);
            //                         }
            //                     }
            //                 })
            //             }, 1000);
            //         })
            //     })

            //     return await promise;
            // },

            applyColFilter() {
                var pFilters = this._colFilters;

                if (pFilters.length > 0) {
                    var oTable = this.byId("mainTab");
                    var oColumns = oTable.getColumns();                    
    
                    pFilters.forEach(item => {
                        oColumns.filter(fItem => fItem.getFilterProperty() === item.sPath)
                            .forEach(col => col.filter(item.oValue1))
                    }) 
                }
            },

            onCloseConfirmDialog: function(oEvent) {
                this._ConfirmDialog.close();
                this._AssignVendorManualDialog.close();
                this.unLock();
            },  
    
            onCancelConfirmDialog: function(oEvent) {   
                this._ConfirmDialog.close();
            },

            filterGlobally: function(oEvent) {
                var sQuery = oEvent.getParameter("query");
                this.exeGlobalSearch(sQuery);
            },

            exeGlobalSearch(arg1) {
                var oFilter = null;
                var aFilter = [];
                var oTable = this.byId("mainTab")
                var aFilteredData = [];

                if (arg1) {
                    this.getView().getModel("columns").getData().results.forEach(item => {
                        if (item.DataType === "BOOLEAN") aFilter.push(new Filter(item.ColumnName, FilterOperator.EQ, arg1));
                        else aFilter.push(new Filter(item.ColumnName, FilterOperator.Contains, arg1));
                    })

                    oFilter = new Filter(aFilter, false);
                }
    
                oTable.getBinding("rows").filter(oFilter, "Application");

                if (arg1 !== "") {
                    var aFilteredIndices = oTable.getBinding("rows").aIndices;
                    var aData = oTable.getModel().getData().rows;

                    aFilteredIndices.forEach(item => {
                        aFilteredData.push(aData.at(item));
                    })
                }
                else {
                    aFilteredData = oTable.getModel().getData().rows;
                }

                var vUnassigned = 0, vPartial = 0;

                aFilteredData.forEach(item => {
                    if (item.VENDOR === "") vUnassigned++;
                    if (item.QTY !== item.ORDEREDQTY && +item.ORDEREDQTY > 0) vPartial++;
                })

                this._counts.total = aFilteredData.length;
                this._counts.unassigned = vUnassigned;
                this._counts.partial = vPartial;
                this.getView().getModel("counts").setData(this._counts);
            },

            setColumnFilters(sTable) {
                if (this.getOwnerComponent().getModel("COLUMN_FILTER_MODEL").getData().items.length > 0) {
                    var oTable = this.byId(sTable);
                    var oColumns = oTable.getColumns();

                    this.getOwnerComponent().getModel("COLUMN_FILTER_MODEL").getData().items.forEach(item => {
                        oColumns.filter(fItem => fItem.getFilterProperty() === item.sPath)
                            .forEach(col => {
                                col.filter(item.oValue1);
                            })
                    })
                } 
            },

            setColumnSorters(sTable) {
                if (this.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").getData().items.length > 0) {
                    var oTable = this.byId(sTable);
                    var oColumns = oTable.getColumns();

                    this.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").getData().items.forEach(item => {
                        oColumns.filter(fItem => fItem.getSortProperty() === item.sPath)
                            .forEach(col => {
                                col.sort(item.bDescending);
                            })
                    })
                } 
            },

            onCustomSmartFilterValueHelp: function() {
                this.oColModel = new JSONModel({
                    "cols": [
                        {
                            "label": "Material Type",
                            "template": "MaterialType",
                            "width": "10rem",
                            "sortProperty": "MaterialType"
                        },
                        {
                            "label": "Description",
                            "template": "Description",
                            "sortProperty": "Description"
                        },
                    ]
                });

                var aCols = this.oColModel.getData().cols;
                this._oBasicSearchField = new SearchField({
                    showSearchButton: false
                });
    
                this._oCustomSmartFilterValueHelpDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.valuehelp.SmartFilterValueHelpDialog", this);
                this.getView().addDependent(this._oCustomSmartFilterValueHelpDialog);
    
                this._oCustomSmartFilterValueHelpDialog.setRangeKeyFields([{
                    label: "Material Type",
                    key: "MaterialType",
                    type: "string",
                    typeInstance: new typeString({}, {
                        maxLength: 4
                    })
                }]);
    
                // this._oCustomSmartFilterValueHelpDialog.getFilterBar().setBasicSearch(this._oBasicSearchField);
    
                this._oCustomSmartFilterValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setModel(this.getView().getModel("materialType"));
                    oTable.setModel(this.oColModel, "columns");

                    if (oTable.bindRows) {
                        oTable.bindAggregation("rows", "/results");
                    }
    
                    if (oTable.bindItems) {
                        oTable.bindAggregation("items", "/results", function () {
                            return new ColumnListItem({
                                cells: aCols.map(function (column) {
                                    return new Label({ text: "{" + column.template + "}" });
                                })
                            });
                        });
                    }
    
                    this._oCustomSmartFilterValueHelpDialog.update();
                }.bind(this));
    
                
                this._oCustomSmartFilterValueHelpDialog.setTokens(this._oMultiInput.getTokens());
                this._oCustomSmartFilterValueHelpDialog.open();
            },

            onCustomSmartFilterValueHelpOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");

                this._oMultiInput.setTokens(aTokens);
                this._oCustomSmartFilterValueHelpDialog.close();
            },
    
            onCustomSmartFilterValueHelpCancelPress: function () {
                this._oCustomSmartFilterValueHelpDialog.close();
            },
    
            onCustomSmartFilterValueHelpAfterClose: function () {
                this._oCustomSmartFilterValueHelpDialog.destroy();
            },
    
            onFilterBarSearch: function (oEvent) {
                var sSearchQuery = this._oBasicSearchField.getValue(),
                    aSelectionSet = oEvent.getParameter("selectionSet");

                var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                    if (oControl.getValue()) {
                        aResult.push(new Filter({
                            path: oControl.getName(),
                            operator: FilterOperator.Contains,
                            value1: oControl.getValue()
                        }));
                    }

                    return aResult;
                }, []);
    
                this._filterTable(new Filter({
                    filters: aFilters,
                    and: true
                }));
            },

            _filterTable: function (oFilter) {
                var oValueHelpDialog = this._oCustomSmartFilterValueHelpDialog;
    
                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter);
                    }
    
                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(oFilter);
                    }
    
                    oValueHelpDialog.update();
                });
            },
    
            _onMultiInputValidate: function(oArgs) {
                var aToken = this._oMultiInput.getTokens();

                if (oArgs.suggestionObject) {
                    var oObject = oArgs.suggestionObject.getBindingContext("materialType").getObject(),
                        oToken = new Token();

                    oToken.setKey(oObject.MaterialType);
                    oToken.setText(oObject.Description + " (" + oObject.MaterialType + ")");
                    aToken.push(oToken)

                    this._oMultiInput.setTokens(aToken);
                    this._oMultiInput.setValueState("None");
                }
                else if (oArgs.text !== "") {
                    this._oMultiInput.setValueState("Error");
                }
    
                return null;
            },

            onCustomSmartFilterValueHelpChange: function(oEvent) {
                if (oEvent.getParameter("value") === "") {
                    this._oMultiInput.setValueState("None");
                }
            },

            formatValueHelp: function(sValue, sPath, sKey, sText, sFormat) {
                var oValue = this.getView().getModel(sPath).getData().filter(v => v[sKey] === sValue);

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

            onWrapText: function(oEvent) {
                this._sActiveTable = oEvent.getSource().data("TableId");
                var vWrap = this.getView().getModel("ui").getData().dataWrap[this._sActiveTable];
                
                this.byId(this._sActiveTable).getColumns().forEach(col => {
                    var oTemplate = col.getTemplate();
                    oTemplate.setWrapping(!vWrap);
                    col.setTemplate(oTemplate);
                })

                this.getView().getModel("ui").setProperty("/dataWrap/" + [this._sActiveTable], !vWrap);
            },

            validateExtendPO: async function(aHdrData, aDtlsData) {
                var me = this;
                var oModel = this.getOwnerComponent().getModel();
                var oParamItems = [];

                this._extendData = [];
                this.showLoadingDialog('Processing...');

                aHdrData.forEach(item => {
                    oParamItems.push({
                        VENDOR: item.VENDOR,
                        PURCHGRP: item.PURCHGRP,
                        PURCHORG: item.PURCHORG,
                        PURCHPLANT: item.PURCHPLANT,
                        SHIPTOPLANT: item.SHIPTOPLANT
                    })

                    item.PAYTERMS = "";
                    item.INCOTERMS = "";
                    item.DESTINATION = "";
                    item.SHIPMODE = "";
                    item.CURR = "";
                })

                this.getOwnerComponent().getModel("CREATEPO_MODEL").setData({
                    header: aHdrData,
                    detail: aDtlsData
                })

                var oParam = {
                    // EXTEND: "",
                    N_ExtendItems: oParamItems
                }

                oModel.create("/ExtendSet", oParam, {
                    method: "POST",
                    success: function(oData, oResponse) {        
                        me.closeLoadingDialog();
                        console.log(oData)

                        if (oData.N_ExtendItems.results.filter(fItem => fItem.PONO !== "").length > 0) {
                            me._extendData = oData.N_ExtendItems.results.filter(fItem => fItem.PONO !== "");
                            me.showExtendOption();
                        }
                        else {
                            me.navToGenPO();
                        }
                    },
                    error: function(err) {
                        sap.m.MessageBox.error(me.getView().getModel("ddtext").getData()["INFO_ERROR"] + ": " + err.message);
                    }
                });
            },

            showExtendOption() {
                var me = this;
                var vRowCount = this._extendData.length.length > 10 ? this._extendData.length : 10;

                me._extendData.forEach(item => {
                    item.VENDORCDNAME = item.NAME + " (" + item.VENDOR + ")";
                })

                if (!me._ExtendDialog) {
                    me._ExtendDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.ExtendDialog", me);
                    
                    me._ExtendDialog.setModel(
                        new JSONModel({
                            rows: this._extendData,
                            rowCount: vRowCount
                        })
                    )

                    me.getView().addDependent(me._ExtendDialog);

                    // var oTableEventDelegate = {
                    //     onkeyup: function (oEvent) {
                    //         me.onKeyUp(oEvent);
                    //     },
    
                    //     onAfterRendering: function (oEvent) {
                    //         var oControl = oEvent.srcControl;
                    //         var sTabId = oControl.sId.split("--")[oControl.sId.split("--").length - 1];
    
                    //         if (sTabId.substr(sTabId.length - 3) === "Tab") me._tableRendered = sTabId;
                    //         else me._tableRendered = "";
    
                    //         me.onAfterTableRendering();
                    //     }
                    // };

                    // sap.ui.getCore().byId("extendTab").addEventDelegate(oTableEventDelegate);
                }
                else {
                    me._ExtendDialog.getModel().setProperty("/rows", this._extendData);
                    me._ExtendDialog.getModel().setProperty("/rowCount", vRowCount);
                }

                me._ExtendDialog.setTitle(me.getView().getModel("ddtext").getData()["EXTENDPOOPTION"]);
                sap.ui.getCore().byId("extendTab").clearSelection();
                me._ExtendDialog.open();
                sap.ui.getCore().byId("extendTab").focus();
            },

            onExecCreatePO: function(oEvent) {
                var oTable = sap.ui.getCore().byId("extendTab");
                console.log(oTable.getModel().getData());
                console.log(oTable.getBinding("rows"));
                console.log(this._ExtendDialog.getModel().getData().rows);
                var oSelectedIndices = oTable.getSelectedIndices();
                var oTmpSelectedIndices = [];
                var aData = oTable.getModel().getData().rows;

                if (oSelectedIndices.length > 0) {
                    oSelectedIndices.forEach(item => {
                        oTmpSelectedIndices.push(oTable.getBinding("rows").aIndices[item])
                    })

                    oSelectedIndices = oTmpSelectedIndices;
                    oSelectedIndices.forEach((item, index) => {
                        var vVendor = aData.at(item).VENDOR;
                        var vPurchOrg = aData.at(item).PURCHORG;
                        var vPurchGrp = aData.at(item).PURCHGRP;
                        var vPurchPlant = aData.at(item).PURCHPLANT;
                        var vShipToPlant = aData.at(item).SHIPTOPLANT;

                        this.getOwnerComponent().getModel("CREATEPO_MODEL").getData().header.forEach(hdr => {
                            if (hdr.VENDOR === vVendor && hdr.PURCHGRP === vPurchGrp && hdr.PURCHORG === vPurchOrg && hdr.PURCHPLANT === vPurchPlant && hdr.SHIPTOPLANT === vShipToPlant) {
                                console.log(aData.at(item))
                                hdr.PONO = aData.at(item).PONO;
                                hdr.EXTEND = true;
                                hdr.SHIPMODE = aData.at(item).SHIPMODE;
                                hdr.PAYTERMS = aData.at(item).PAYTERMS;
                                hdr.INCOTERMS = aData.at(item).INCOTERMS;
                                hdr.DESTINATION = aData.at(item).DESTINATION;
                                hdr.CURR = aData.at(item).CURR;
                            }
                        })
                    })
                }

                console.log(this.getOwnerComponent().getModel("CREATEPO_MODEL").getData());
                this.navToGenPO();
            },

            convertUOM(baseUOM, entryUOM, tabModel, rowPath) {
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var oParam = {
                    matnr: "",
                    uom_from: baseUOM,
                    uom_to: entryUOM,
                    numerator: "",
                    denominator: "",
                    msg: ""
                }

                oModel.create("/UOMConvert", oParam, {
                    method: "POST",
                    success: function(oResult, oResponse) {
                        if (!(oResult.numerator === "" || oResult.denominator === "")) {
                            tabModel.setProperty(rowPath + "/NUMERATOR", oResult.numerator);
                            tabModel.setProperty(rowPath + "/DENOMINATOR", oResult.denominator);
                            tabModel.setProperty(rowPath + "/UOMCONV", true);
                        }
                        else if (baseUOM === entryUOM) {
                            tabModel.setProperty(rowPath + "/NUMERATOR", "1");
                            tabModel.setProperty(rowPath + "/DENOMINATOR", "1");
                            tabModel.setProperty(rowPath + "/UOMCONV", true);
                        }
                        else {
                            tabModel.setProperty(rowPath + "/UOMCONV", false);
                        }
                    },
                    error: function() { }
                }); 
            },

            formatDateToYYYYMMDD(date) {
                var year = date.getFullYear();
                var month = ('0' + (date.getMonth() + 1)).slice(-2);
                var day = ('0' + date.getDate()).slice(-2);
                
                return year + '-' + month + '-' + day;
            },
            
            suggestionRowValidator: function (oColumnListItem) {
                var aCells = oColumnListItem.getCells();
                console.log(aCells)
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

            //******************************************* */
            // Column Filtering
            //******************************************* */

            onColFilterClear: function(oEvent) {
                TableFilter.onColFilterClear(oEvent, this);
            },

            onColFilterCancel: function(oEvent) {
                TableFilter.onColFilterCancel(oEvent, this);
            },

            onColFilterConfirm: function(oEvent) {
                TableFilter.onColFilterConfirm(oEvent, this);
            },

            onFilterItemPress: function(oEvent) {
                TableFilter.onFilterItemPress(oEvent, this);
            },

            onFilterValuesSelectionChange: function(oEvent) {
                TableFilter.onFilterValuesSelectionChange(oEvent, this);
            },

            onSearchFilterValue: function(oEvent) {
                TableFilter.onSearchFilterValue(oEvent, this);
            },

            onCustomColFilterChange: function(oEvent) {
                TableFilter.onCustomColFilterChange(oEvent, this);
            },

            onSetUseColFilter: function(oEvent) {
                TableFilter.onSetUseColFilter(oEvent, this);
            },

            onRemoveColFilter: function(oEvent) {
                TableFilter.onRemoveColFilter(oEvent, this);
            },

            //******************************************* */
            // Smart Filter
            //******************************************* */

            beforeVariantFetch: function(oEvent) {
                SmartFilterCustomControl.beforeVariantFetch(this);
            },

            afterVariantLoad: function(oEvent) {
                SmartFilterCustomControl.afterVariantLoad(this);
            },

            clearSmartFilters: function(oEvent) {
                SmartFilterCustomControl.clearSmartFilters(this);
            }

        });
    }
);
