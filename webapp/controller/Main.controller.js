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
        "../js/TableValueHelp"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Common, Token, Filter, FilterOperator, SearchField, typeString, ColumnListItem, Label, TableFilter, TableValueHelp) {
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
                this._oModelColumns = [];
                this._aColumns = [];
                this._colFilters = {};

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

                this.showLoadingDialog('Loading...');

                this._counts = {
                    total: 0,
                    unassigned: 0,
                    partial: 0
                }

                this.getView().setModel(new JSONModel({
                    sbu: '',
                    currsbu: ''
                }), "ui");

                this._sbuChange = false;
                var oJSONDataModel = new JSONModel(); 
                oJSONDataModel.setData(this._counts);

                this.getView().setModel(oJSONDataModel, "counts");

                this.setSmartFilterModel();
                this._oAssignVendorData = [];
                this._oCreateData = [];
                this._oLock = [];

                var oModel = this.getOwnerComponent().getModel("ZVB_3DERP_ANP_FILTERS_CDS");
                oModel.read("/ZVB_3DERP_SBU_SH", {
                    success: function (oData, oResponse) {
                        if (oData.results.length === 1) {
                            that.getView().getModel("ui").setProperty("/sbu", oData.results[0].SBU);
                            that.getColumns("AUTO_INIT");
                        }
                        else {
                            that.closeLoadingDialog();
                            that.byId("searchFieldMain").setEnabled(false);
                            that.byId("btnAssign").setEnabled(false);                            
                            that.byId("btnUnassign").setEnabled(false);
                            that.byId("btnCreatePO").setEnabled(false);
                            that.byId("btnTabLayout").setEnabled(false);
                            that.byId("btnManualAssign").setEnabled(false);
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

                this._oMultiInput = this.getView().byId("multiInputMatTyp");
                this._oMultiInput.addValidator(this._onMultiInputValidate.bind(this));

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

                this.getColumnProp();
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
                }
                else {
                    this.byId("searchFieldMain").setEnabled(false);
                    this.byId("btnAssign").setEnabled(false);
                    this.byId("btnUnassign").setEnabled(false);
                    this.byId("btnCreatePO").setEnabled(false);
                    this.byId("btnTabLayout").setEnabled(false);
                    this.byId("btnManualAssign").setEnabled(false);
                }

                oModel.read("/ZVB_3DERP_MATTYPE_SH", {
                    urlParameters: {
                        "$filter": "SBU eq '" + vSBU + "'"
                    },                    
                    success: function (oData, oResponse) {
                        if (oData.results.length > 0){
                            var aData = new JSONModel({results: oData.results.filter(item => item.SBU === vSBU)});
                            me.getView().setModel(aData, "materialType");
                        }
                        else{
                            var aData = new JSONModel({results: []});
                            me.getView().setModel(aData, "materialType");
                        }
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

                this._tableRendered = "mainTab";
            },

            setTableColumns() {
                var me = this;
                var oTable = this.getView().byId("mainTab");

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

                    if (sColumnWidth === 0) sColumnWidth = 100;

                    if (sColumnDataType === "NUMBER") {
                        return new sap.ui.table.Column({
                            id: sColumnId,
                            label: sColumnLabel,
                            template: me.columnTemplate(sColumnId, sColumnType),
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
                            label: sColumnLabel,
                            template: me.columnTemplate(sColumnId, sColumnType),
                            width: sColumnWidth + 'px',
                            sortProperty: sColumnId,
                            // filterProperty: sColumnId,
                            autoResizable: true,
                            visible: sColumnVisible,
                            sorted: sColumnSorted,                        
                            hAlign: sColumnDataType === "NUMBER" ? "End" : sColumnDataType === "BOOLEAN" ? "Center" : "Begin",
                            sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending" ),
                        });
                    }
                });

                TableFilter.updateColumnMenu("mainTab", this);
            },
            
            columnTemplate: function (sColumnId, sColumnType) {
                var oColumnTemplate;

                oColumnTemplate = new sap.m.Text({ 
                    text: "{" + sColumnId + "}", 
                    wrapping: false,
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
                var aFilters = [],
                    aFilter = [],
                    aCustomFilter = [],
                    aSmartFilter = [];
                
                if (oSmartFilter.length > 0)  {
                    oSmartFilter[0].aFilters.forEach(item => {
                        if (item.aFilters === undefined) {
                            aFilter.push(new Filter(item.sPath, item.sOperator, item.oValue1));
                        }
                        else {
                            aFilters.push(item);
                        }
                    })

                    if (aFilter.length > 0) { aFilters.push(new Filter(aFilter, false)); }
                }

                if (this.getView().byId("smartFilterBar")) {
                    var oCtrl = this.getView().byId("smartFilterBar").determineControlByName("MATERIALTYPE");

                    if (oCtrl) {
                        var aCustomFilter = [];

                        if (oCtrl.getTokens().length === 1) {
                            oCtrl.getTokens().map(function(oToken) {
                                aFilters.push(new Filter("MATERIALTYPE", FilterOperator.EQ, oToken.getKey()))
                            })
                        }
                        else if (oCtrl.getTokens().length > 1) {
                            oCtrl.getTokens().map(function(oToken) {
                                aCustomFilter.push(new Filter("MATERIALTYPE", FilterOperator.EQ, oToken.getKey()))
                            })

                            aFilters.push(new Filter(aCustomFilter));
                        }
                    }
                }

                aSmartFilter.push(new Filter(aFilters, true));
                
                oModel.read("/MainSet", { 
                    filters: aSmartFilter,
                    success: function (oData, oResponse) {
                        var vUnassigned = 0, vPartial = 0;

                        oData.results.forEach((item, index) => {
                            if (item.VENDOR === '') vUnassigned++;
                            if (item.QTY !== item.ORDEREDQTY && +item.ORDEREDQTY > 0) vPartial++;
                            item.DELVDATE = dateFormat.format(item.DELVDATE);

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
                            "$filter": "Sbu eq '" + vSBU + "'"
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

            onManualAssign: function (oEvent) {
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
                            "$filter": "Sbu eq '" + vSBU + "'"
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

                            oTable.getRows()[index].getCells()[1].bindAggregation("suggestionItems", {
                                path: "vendor>/" + vMatNo,
                                length: 10000,
                                template: new sap.ui.core.ListItem({
                                    key: "{vendor>LIFNR}",
                                    text: "{vendor>LIFNR}",
                                    additionalText: "{vendor>NAME1}"
                                })
                            });

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

                oSource.getSuggestionItems().forEach(item => {
                    if (item.getProperty("key") === oSource.getValue().trim()) {
                        isInvalid = false;
                        oSource.setValueState(isInvalid ? "Error" : "None");
                    }
                })
    
                oSource.getSuggestionItems().forEach(item => {
                    if (item.getProperty("key") === oSource.getValue().trim()) {
                        isInvalid = false;
                        oSource.setValueState(isInvalid ? "Error" : "None");
                    }
                })
    
                if (isInvalid) { 
                    this._validationErrors.push(oEvent.getSource().getId());

                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', "");
                    this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', "");
                }
                else {
                    this._AssignVendorManualDialog.getModel().setProperty(sPath, oSource.getSelectedKey());

                    if (oSource.getSelectedKey() === "") {
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', "");
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', "");
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', "");
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', "");
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', "");
                    }
                    else {
                        var vMatNo = this._AssignVendorManualDialog.getModel().getProperty(sRowPath + "/MATERIALNO");
                        var oVendor = this.getView().getModel("vendor").getData()[vMatNo].filter(fItem => fItem.LIFNR === oSource.getSelectedKey());
                        
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/VENDORNAME', oVendor[0].NAME1);                           
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/CURR', oVendor[0].WAERS);
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/PAYTERMS', oVendor[0].ZTERM);                           
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO1', oVendor[0].INCO1);
                        this._AssignVendorManualDialog.getModel().setProperty(sRowPath + '/INCO2', oVendor[0].INCO2);
                    }
    
                    this._validationErrors.forEach((item, index) => {
                        if (item === oEvent.getSource().getId()) {
                            this._validationErrors.splice(index, 1)
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
                var oSmartFilter = this.getView().byId("smartFilterBar").getFilters();

                if (oSmartFilter.length > 0) {
                    var aFilters = oSmartFilter[0].aFilters;

                    if (aFilters.length === 1) {
                        if (aFilters[0].sPath === 'VENDOR') {
                            if (!isNaN(aFilters[0].oValue1)) {
                                while (aFilters[0].oValue1.length < 10) aFilters[0].oValue1 = "0" + aFilters[0].oValue1;
                            }
                        }
                    }
                    else {
                        aFilters.forEach(item => {
                            if (item.aFilters[0].sPath === 'VENDOR') {
                                if (!isNaN(item.aFilters[0].oValue1)) {
                                    while (item.aFilters[0].oValue1.length < 10) item.aFilters[0].oValue1 = "0" + item.aFilters[0].oValue1;
                                }
                            }
                        })
                    }
                }

                //get styles data for the table
                var oJSONDataModel = new JSONModel(); 

                oModel.read("/MainSet", {
                    filters: oSmartFilter,
                    success: function (oData, oResponse) {
                        var vUnassigned = 0, vPartial = 0;

                        oData.results.forEach((item, index) => {
                            if (item.VENDOR === '') vUnassigned++;
                            if (item.QTY !== item.ORDEREDQTY && +item.ORDEREDQTY > 0) vPartial++;
                            item.DELVDATE = dateFormat.format(item.DELVDATE);

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
                        // me.setTableData();
                        // me.applyColFilter();

                        me.byId("mainTab").getModel().setProperty("/rows", oData.results);
                        me.byId("mainTab").bindRows("/rows");

                        // if (me.getOwnerComponent().getModel("COLUMN_FILTER_MODEL").getData().items.length > 0) me.setColumnFilters("mainTab");
                        if (me.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").getData().items.length > 0) me.setColumnSorters("mainTab");
                        TableFilter.applyColFilters(me);
                    },
                    error: function (err) { }
                });

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
                        WIDTH: column.mProperties.width.replace('rem','')
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
                                "$filter": "Sbu eq '" + vSBU + "'"
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

                                                                oParamData.push({
                                                                    DOCTYPE: returnData[0].PODOCTYP,
                                                                    VENDOR: item.VENDOR,
                                                                    PURCHORG: item.PURCHORG,
                                                                    PURCHGRP: item.PURCHGRP,
                                                                    COMPANY: item.COMPANY,
                                                                    PURCHPLANT: item.PURCHPLANT,
                                                                    SHIPTOPLANT: item.SHIPTOPLANT,
                                                                    VENDORNAME: item.VENDORNAME,
                                                                    CUSTGRP: item.CUSTGRP
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

                                                    oParamData.push({
                                                        DOCTYPE: returnData[0].PODOCTYP,
                                                        VENDOR: item.VENDOR,
                                                        PURCHORG: item.PURCHORG,
                                                        PURCHGRP: item.PURCHGRP,
                                                        COMPANY: item.COMPANY,
                                                        PURCHPLANT: item.PURCHPLANT,
                                                        SHIPTOPLANT: item.SHIPTOPLANT,
                                                        VENDORNAME: item.VENDORNAME,
                                                        CUSTGRP: item.CUSTGRP
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

                //Add GROUP key
                oCreatePOHdr.forEach((item, index) => {
                    item.GROUP = (index + 1) + "";

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
                                    me.navToGenPO(oCreatePOHdr, oCreatePODtls);
                                }
                            },
                            error: function (err) { 
                                counter++;
                                if (counter === oCreatePODtls.length) {
                                    me.navToGenPO(oCreatePOHdr, oCreatePODtls);
                                }
                            }
                        })
                    }, 100); 
                })
            },

            navToGenPO(arg1, arg2) {
                var oCreatePOHdr = arg1;
                var oCreatePODtls = arg2;

                this.getOwnerComponent().getModel("UI_MODEL").setProperty("/sbu", this.getView().getModel("ui").getData().sbu);

                if (this.byId("mainTab").getBinding("rows").aSorters.length > 0) {
                    this._aColSorters = this.byId("mainTab").getBinding("rows").aSorters;
                    this.getOwnerComponent().getModel("COLUMN_SORTER_MODEL").setProperty("/items", this._aColSorters);
                }

                this.getOwnerComponent().getModel("CREATEPO_MODEL").setData({
                    header: oCreatePOHdr,
                    detail: oCreatePODtls
                })

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
                var oModelLock = me.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
                var oParamLock = {};
                var sError = "";
                
                var promise = new Promise((resolve, reject) => {
                    oParamLock["N_IMPRTAB"] = me._oLock;
                    oParamLock["iv_count"] = 300;
                    oParamLock["N_LOCK_MESSAGES"] = []; 

                    oModelLock.create("/Lock_PRSet", oParamLock, {
                        method: "POST",
                        success: function(oResultLock) {
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
                // if (this._oLock.length > 0) {
                    var oModelLock = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
                    var oParamUnLock = {};
    
                    oParamUnLock["N_IMPRTAB"] = this._oLock;
    
                    setTimeout(() => {
                        oModelLock.create("/Unlock_PRSet", oParamUnLock, {
                            method: "POST",
                            success: function(oResultLock) { },
                            error: function (err) { }
                        })
        
                        this._oLock = [];                    
                    }, 10);
                // }
            },

            singlelock: async (me) => {
                var oModelLock = me.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
                oModelLock.setUseBatch(true);
                var oParamLock = {};
                var sError = "";
                var vCounter = 0;
                
                var promise = new Promise((resolve, reject) => {
                    me._oLock.forEach(item => {
                        setTimeout(() => {
                            var oLockItem = [];
                            oLockItem.push(item);
    
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
                                        resolve(false);
                                    }
                                }
                            });                            
                        }, 1);
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

        });
    }
);
