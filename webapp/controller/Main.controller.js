sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "../js/Common",
    "sap/m/Token"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Common, Token) {
        "use strict";

        var that;
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "MM/dd/yyyy" });
        var sapDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });

        return Controller.extend("zuiaprocess.controller.Main", {

            onInit: function () {
                that = this;
                this._oModel = this.getOwnerComponent().getModel();

                if (sap.ui.getCore().byId("backBtn") !== undefined) {
                    this._fBackButton = sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction;

                    var oView = this.getView();
                    oView.addEventDelegate({
                        onAfterShow: function(oEvent){
                            sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = that._fBackButton; 
                            
                            if (that.getOwnerComponent().getModel("UI_MODEL").getData().flag) {
                                that.refresh();
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
                    sbu: ''
                }), "ui");

                this._sbuChange = false;
                var oJSONDataModel = new JSONModel(); 
                oJSONDataModel.setData(this._counts);

                // oJSONDataModel.setData(oData);
                this.getView().setModel(oJSONDataModel, "counts");

                this.setSmartFilterModel();
                this._oAssignVendorData = [];
                this._oCreateData = [];
                this._oLock = [];

                var oModel = this.getOwnerComponent().getModel("ZVB_3DERP_ANP_FILTERS_CDS");
                oModel.read("/ZVB_3DERP_SBU_SH", {
                    success: function (oData, oResponse) {
                        // console.log(oData)
                        if (oData.results.length === 1) {
                            that.getView().getModel("ui").setProperty("/sbu", oData.results[0].SBU);
                            that.getColumns("AUTO_INIT");
                        }
                        else {
                            that.closeLoadingDialog();
                            that.byId("searchFieldMain").setEnabled(false);
                            that.byId("btnAssign").setEnabled(false);
                            that.byId("btnAssign").setEnabled(false);
                            that.byId("btnUnassign").setEnabled(false);
                            that.byId("btnCreatePO").setEnabled(false);
                            that.byId("btnTabLayout").setEnabled(false);
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
                oDDTextParam.push({CODE: "CONFIRM_DISREGARD_CHANGE"});
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

                oModel.create("/CaptionMsgSet", { CaptionMsgItems: oDDTextParam  }, {
                    method: "POST",
                    success: function(oData, oResponse) {        
                        // console.log(oData)
                        oData.CaptionMsgItems.results.forEach(item => {
                            oDDTextResult[item.CODE] = item.TEXT;
                        })

                        oJSONModel.setData(oDDTextResult);
                        that.getView().setModel(oJSONModel, "ddtext");
                        // console.log(that.getView().getModel("ddtext"))
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
                this._colFilters = [];
            },

            onExit: function() {
                sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = this._fBackButton;
            },

            onSBUChange: function(oEvent) {
                this._sbuChange = true;
                // console.log(this.byId('cboxSBU').getSelectedKey());
                // var vSBU = this.byId('cboxSBU').getSelectedKey();
                
                // this.showLoadingDialog('Loading...');
                // this.getGMC();
                // console.log(this.getView().byId("btnTabLayout"))
                this.byId("searchFieldMain").setEnabled(false);
                this.byId("btnAssign").setEnabled(false);
                this.byId("btnAssign").setEnabled(false);
                this.byId("btnUnassign").setEnabled(false);
                this.byId("btnCreatePO").setEnabled(false);
                this.byId("btnTabLayout").setEnabled(false);
            },

            getColumns(arg) {
                var me = this;

                //get dynamic columns based on saved layout or ZERP_CHECK
                var oJSONColumnsModel = new JSONModel();
                // this.oJSONModel = new JSONModel();

                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_COMMON_SRV");
                var vSBU = this.getView().getModel("ui").getData().sbu;
                // console.log(oModel)
                oModel.setHeaders({
                    sbu: vSBU,
                    type: 'APROCESS',
                    tabname: 'ZDV_3DERP_ANP'
                });

                oModel.read("/ColumnsSet", {
                    success: function (oData, oResponse) {
                        // console.log(oData);
                        oJSONColumnsModel.setData(oData);
                        // me.oJSONModel.setData(oData);
                        me.getView().setModel(oJSONColumnsModel, "columns"); //set the view model

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
                            // console.log(me.byId("mainTab"))
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
                            if (item.QTY !== item.ORDERQTY) vPartial++;
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
                // console.log(oDataModel)
                //set the column and data model
                var oModel = new JSONModel();

                oModel.setData({
                    columns: oColumnsData,
                    rows: oData
                });

                var oTable = this.getView().byId("mainTab");
                oTable.setModel(oModel);

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
                    // var sColumnToolTip = context.getObject().Tooltip;
                    //alert(sColumnId.);
                    // console.log(context.getObject().DataType)
                    if (sColumnWidth === 0) sColumnWidth = 100;
                    // console.log(context)
                    if (sColumnDataType === "NUMBER") {
                        return new sap.ui.table.Column({
                            id: sColumnId,
                            label: sColumnLabel,
                            template: me.columnTemplate(sColumnId, sColumnType),
                            width: sColumnWidth + 'px',
                            sortProperty: sColumnId,
                            filterProperty: sColumnId,
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
                            filterProperty: sColumnId,
                            autoResizable: true,
                            visible: sColumnVisible,
                            sorted: sColumnSorted,                        
                            hAlign: sColumnDataType === "NUMBER" ? "End" : sColumnDataType === "BOOLEAN" ? "Center" : "Begin",
                            sortOrder: ((sColumnSorted === true) ? sColumnSortOrder : "Ascending" ),
                        });
                    }
                });
            },
            // hAlign: "End",
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
                // console.log(oModel)
                var oSmartFilter = this.getView().byId("smartFilterBar");
                oSmartFilter.setModel(oModel);
                // console.log(oSmartFilter)

                // var oMultiInput2 = this.getView().byId("multiInput2");
                // oMultiInput2.addValidator(function(args){
                //     if (args.suggestionObject){
                //         var key = args.suggestionObject.getCells()[0].getText();
                //         var text = key + "(" + args.suggestionObject.getCells()[1].getText() + ")";
    
                //         return new Token({key: key, text: text});
                //     }
                //     return null;
                // });
                // console.log(oSmartFilter)
                //modify smartfilter control width

                // var ivSmartFilter = setInterval(() => {
                //     if (oSmartFilter !== undefined) {
                //         oSmartFilter.getControlByKey("SBU").oParent.setWidth("100px");
                //         oSmartFilter.getControlByKey("IONUMBER").oParent.setWidth("155px");
                //         oSmartFilter.getControlByKey("MATERIALGRP").oParent.setWidth("135px");
                //         oSmartFilter.getControlByKey("MATERIALTYPE").oParent.setWidth("135px");
                //         oSmartFilter.getControlByKey("SEASON").oParent.setWidth("225px");
                //         oSmartFilter.getControlByKey("SHIPTOPLANT").oParent.setWidth("135px");
                //         oSmartFilter.getControlByKey("PURCHPLANT").oParent.setWidth("135px");
                //         oSmartFilter.getControlByKey("PRNUMBER").oParent.setWidth("180px");

                //         clearInterval(ivSmartFilter);
                //     }                    
                // }, 500);

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
                // console.log(this.getView().byId("smartFilterBar").getFilterData());
                // console.log(this.getView().byId("smartFilterBar").getFilters());
                this.byId("searchFieldMain").setProperty("value", "");
                this.showLoadingDialog('Loading...');

                var vSBU = this.getView().byId("cboxSBU").getSelectedKey();
                var me = this;
                var oModel = this.getOwnerComponent().getModel("ZVB_3DERP_ANP_FILTERS_CDS");
                var oJSONDataModel = new JSONModel(); 
                var matTypListItem = [];
                console.log(this.getView())
                oModel.read("/ZVB_3DERP_MATTYPE_SH", {
                    success: function (oData, oResponse) {
                        console.log(oData)
                        if (oData.results.length >0) {
                            oData.results.forEach(item => {
                                if(item.SBU === vSBU){
                                    var key = "ZVB_3DERP_MATTYPE_SH_FILTER('" + item.MaterialType + "')";
                                    
                                    matTypListItem.push(item)
                                }
                            });
                            oJSONDataModel.setData(matTypListItem);
                            me.getView().setModel(oJSONDataModel, "ZVB_3DERP_MATTYPE_SH_FILTER");
                            
                            console.log(me.getView());
                        }
                        else {
                        }
                    },
                    error: function (err) { }
                });
                console.log(oModel)

                if (this.getView().getModel("ui").getData().sbu === '' || this._sbuChange) {
                    this.getColumns('MANUAL_INIT');
                }
                else {
                    this.getView().getModel("ui").setProperty("/sbu", vSBU);
                    
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
                
                var aFilters = this.getView().byId("smartFilterBar").getFilters();   
                var aFiltersObj = [];
                
                aFiltersObj.push(aFilters)
                aFiltersObj = aFiltersObj[0]
                if (this.getView().byId("smartFilterBar")) {

                    var oCtrl = this.getView().byId("smartFilterBar").determineControlByName("MATERIALTYPE");
                    if (oCtrl) {
                        oCtrl.getTokens().map(function(oToken) {
                            if(aFilters.length === 0){
                                aFiltersObj.push({
                                    aFilters: [{
                                        sPath: "MATERIALTYPE",
                                        sOperator: "EQ",
                                        oValue1: oToken.getKey(),
                                        _bMultiFilter: false
                                    }]
                                })
                            }else{
                                aFiltersObj[0].aFilters[parseInt(Object.keys(aFiltersObj[0].aFilters).pop())+1] = ({
                                    sPath: "MATERIALTYPE",
                                    sOperator: "EQ",
                                    oValue1: oToken.getKey(),
                                    _bMultiFilter: false
                                })
                            }
                            // me.getView().byId("smartFilterBar").setFilterData({
                            //     _CUSTOM: {
                            //         item: {key: oToken.getKey(), text: oToken.getKey()}, 
                            //     }
                            
                            // });
                        })
                    }
                }
                
                console.log(aFiltersObj);
                console.log(aFilters);
                if (aFilters.length > 0) {
                    aFilters[0].aFilters.forEach(item => {
                        if (item.sPath === 'VENDOR') {
                            if (!isNaN(item.oValue1)) {
                                while (item.oValue1.length < 10) item.oValue1 = "0" + item.oValue1;
                            }
                        }
                    })
                }

                // console.log(this.byId('mainTab').getColumns());
                // this.addDateFilters(aFilters); //date not automatically added to filters
                console.log(aFilters);
                oModel.read("/MainSet", { 
                    filters: aFilters,
                    success: function (oData, oResponse) {
                        var vUnassigned = 0, vPartial = 0;

                        oData.results.forEach((item, index) => {
                            if (item.VENDOR === '') vUnassigned++;
                            if (item.QTY !== item.ORDERQTY) vPartial++;
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
                        
                        // me.setChangeStatus(false);

                        me.byId("searchFieldMain").setEnabled(true);
                        me.byId("btnAssign").setEnabled(true);
                        me.byId("btnAssign").setEnabled(true);
                        me.byId("btnUnassign").setEnabled(true);
                        me.byId("btnCreatePO").setEnabled(true);
                        me.byId("btnTabLayout").setEnabled(true);
                    },
                    error: function (err) { 
                        // console.log(err)
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
                            // console.log(oSelectedIndices)
                            oSelectedIndices.forEach((item, index) => {
                                if (oDataCheck.results.length > 0) {
                                    if (oDataCheck.results.filter(fItem => fItem.Field2 === aData.at(item).MATERIALTYPE).length === 0) {
                                        oParamData.push({
                                            Vendor: aData.at(item).VENDOR,
                                            Material: aData.at(item).MATERIALNO,
                                            PurchOrg: aData.at(item).PURCHORG,
                                            PurGroup: aData.at(item).PURCHGRP,
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
                                    else vMatTypExist = true;
                                }
                                else {
                                    oParamData.push({
                                        Vendor: aData.at(item).VENDOR,
                                        Material: aData.at(item).MATERIALNO,
                                        PurchOrg: aData.at(item).PURCHORG,
                                        PurGroup: aData.at(item).PURCHGRP,
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
                            })
                            
                            if (oParamData.length > 0) {
                                me.showLoadingDialog('Processing...');

                                // console.log("before lock");
                                var bProceed = await me.lock(me);
                                if (!bProceed) return;
                                // console.log("after lock");

                                oParamData = oParamData.filter((value, index, self) => self.findIndex(item => item.Vendor === value.Vendor && item.Material === value.Material && item.PurchOrg === value.PurchOrg && item.PurGroup === value.PurGroup) === index) ;
                                oParam['N_GetInfoRecMatParam'] = oParamData;
                                oParam['N_GetInfoRecReturn'] = [];
                                console.log(oParam)
                                oModel.create("/GetInfoRecordSet", oParam, {
                                    method: "POST",
                                    success: function(oResult, oResponse) {
                                        var oManualAssignVendorData = [];
                                        oParamData = [];
                                        oParam = {};
            
                                        oSelectedIndices.forEach(selItemIdx => {
                                            var returnData = jQuery.extend(true, [], oResult.N_GetInfoRecReturn.results);
                                            // console.log(oResult.N_GetInfoRecReturn.results)
                                            if (aData.at(selItemIdx).VENDOR !== '') returnData = returnData.filter(fItem => fItem.Vendor === aData.at(selItemIdx).VENDOR);
                                            if (aData.at(selItemIdx).MATERIALNO !== '') returnData = returnData.filter(fItem => fItem.Material === aData.at(selItemIdx).MATERIALNO);
                                            // if (aData.at(selItemIdx).PURCHPLANT !== '') returnData = returnData.filter(fItem => fItem.Plant === aData.at(selItemIdx).PURCHPLANT);
                                            if (aData.at(selItemIdx).PURCHGRP !== '') returnData = returnData.filter(fItem => fItem.PurGroup === aData.at(selItemIdx).PURCHGRP);
                                            if (aData.at(selItemIdx).PURCHORG !== '') returnData = returnData.filter(fItem => fItem.PurchOrg === aData.at(selItemIdx).PURCHORG);
                                            // console.log(returnData)
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
                                                            // var oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO);
                                                            var oRetMsg = oResultCPR.N_ChangePRReturn.results.filter(fItem => fItem.PreqNo === item.PRNUMBER);
                                                            
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
                                                                    rowCount: oManualAssignVendorData.length
                                                                })
                                                            )
            
                                                            me.getView().addDependent(me._AssignVendorDialog);
                                                        }
                                                        else {
                                                            me._AssignVendorDialog.getModel().setProperty("/items", oManualAssignVendorData);
                                                            me._AssignVendorDialog.getModel().setProperty("/rowCount", oManualAssignVendorData.length);
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
                                                        rowCount: oManualAssignVendorData.length
                                                    })
                                                )
            
                                                me.getView().addDependent(me._AssignVendorDialog);
                                            }
                                            else {
                                                me._AssignVendorDialog.getModel().setProperty("/items", oManualAssignVendorData);
                                                me._AssignVendorDialog.getModel().setProperty("/rowCount", oManualAssignVendorData.length);
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
                // console.log(this._AssignVendorDialog)
                var me = this;
                var oModel = this.getOwnerComponent().getModel("ZGW_3DERP_RFC_SRV");
                var oSource = oEvent.getSource();
                // console.log(oSource.oParent)
                var oTable = oSource.oParent.getContent()[0];
                // console.log(oTable)
                var oSelectedIndices = oTable.getSelectedIndices();
                var aData = oTable.getModel().getData().items;
                var oParamData = [];
                var oParam = {};
                // console.log(oTable.getSelectedIndices())

                // this._oAssignVendorData = [];

                if (oSelectedIndices.length > 0) {
                    oSelectedIndices.forEach((selItemIdx, index) => {
                        oParamData.push({
                            PR: aData.at(selItemIdx).PRNUMBER + aData.at(selItemIdx).PRITEMNO
                        })
                    })

                    // console.log(oParamData)
                    // console.log(oParamData.filter((value, index, self) => self.findIndex(item => item.PR === value.PR) === index))
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
                        // console.log(oParam)
                        oModel.create("/ChangePRSet", oParam, {
                            method: "POST",
                            success: function(oResultCPR, oResponse) {
                                // console.log(oResultCPR);

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

                                                        me._refresh = true;
                                                    })
                                                // var pVendor = oParamData.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO)[0].DesVendor;
                                                // var pPurchOrg = oParamData.filter(fItem => fItem.PreqNo === item.PRNUMBER && fItem.PreqItem === item.PRITEMNO)[0].PurchOrg;
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
                                // MessageBox.information(res.RetMsgSet.results[0].Message);
                            },
                            error: function() {
                                // alert("Error");
                                me.unLock();
                            }
                        });                        
                    }
                }
                else {
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_SEL_RECORD_TO_PROC"]);
                }

                // this._AssignVendorDialog.close();
            },

            onAssignVendorManualCancel: function(oEvent) {
                this._AssignVendorDialog.close();

                var oSource = oEvent.getSource();
                var oTable = oSource.oParent.getContent()[0];
                console.log(oTable.getModel().getData().items);
                
                this._oAssignVendorData.forEach(item => {
                    oTable.getModel().getData().items.filter(fItem => fItem.PRNUMBER === item.PRNUMBER && fItem.PRITEMNO === item.PRITEMNO).forEach(rItem => item.REMARKS = "Assign vendor cancelled.");
                })

                this.showAssignVendorResult("assign");
            },

            onAssignVendorClose: function(oEvent) {
                if (this._refresh) this.refreshTableData();

                this._AssignVendorResultDialog.close();
                
                if (this._AssignVendorDialog !== undefined) {
                    var oTable = sap.ui.getCore().byId("assignVendorTab");
                    oTable.clearSelection();

                    this._AssignVendorDialog.close();
                }
            },

            showAssignVendorResult(arg) {
                // console.log(this._oAssignVendorData)
                // display pop-up for user selection
                this.unLock();

                if (!this._AssignVendorResultDialog) {
                    this._AssignVendorResultDialog = sap.ui.xmlfragment("zuiaprocess.view.fragments.dialog.AssignVendorResultDialog", this);

                    this._AssignVendorResultDialog.setModel(
                        new JSONModel({
                            items: this._oAssignVendorData,
                            rowCount: this._oAssignVendorData.length
                        })
                    )

                    this.getView().addDependent(this._AssignVendorResultDialog);
                }
                else {
                    this._AssignVendorResultDialog.getModel().setProperty("/items", this._oAssignVendorData);
                    this._AssignVendorResultDialog.getModel().setProperty("/rowCount", this._oAssignVendorData.length);
                }

                if (arg === "assign") this._AssignVendorResultDialog.setTitle("Assign Vendor Result");
                if (arg === "unassign") this._AssignVendorResultDialog.setTitle("Undo Assignment Result");

                this._AssignVendorResultDialog.open();
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
                                PurchOrg: '',
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
                        
                        // console.log("before lock");
                        var bProceed = await this.lock(this);
                        if (!bProceed) return;
                        // console.log("after lock");

                        oParam['N_ChangePRParam'] = oParamData;
                        oParam['N_ChangePRReturn'] = [];
                        // console.log(oParam)
                        oModel.create("/ChangePRSet", oParam, {
                            method: "POST",
                            success: function(oResultCPR, oResponse) {
                                // console.log(oResultCPR);
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
                                // MessageBox.information(res.RetMsgSet.results[0].Message);
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
                    // aDataToEdit = aData;
                    sap.m.MessageBox.information(me.getView().getModel("ddtext").getData()["INFO_NO_SEL_RECORD_TO_PROC"]);
                }
            },

            refreshTableData: function () {
                this.showLoadingDialog('Loading...');
                this.byId("searchFieldMain").setProperty("value", "");

                var me = this; 
                var oModel = this.getOwnerComponent().getModel();
                var aFilters = this.getView().byId("smartFilterBar").getFilters();

                if (aFilters.length > 0) {
                    aFilters[0].aFilters.forEach(item => {
                        // console.log(item)
                        if (item.sPath === 'VENDOR') {
                            if (!isNaN(item.oValue1)) {
                                while (item.oValue1.length < 10) item.oValue1 = "0" + item.oValue1;
                            }
                        }
                    })
                }

                if (this.getView().byId("mainTab").getBinding("rows")) {
                    this._colFilters = this.getView().byId("mainTab").getBinding("rows").aFilters;
                }

                //get styles data for the table
                var oJSONDataModel = new JSONModel(); 

                oModel.read("/MainSet", {
                    filters: aFilters,
                    success: function (oData, oResponse) {
                        var vUnassigned = 0, vPartial = 0;
                        // console.log(oData)
                        oData.results.forEach((item, index) => {
                            if (item.VENDOR === '') vUnassigned++;
                            if (item.QTY !== item.ORDERQTY) vPartial++;
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
                        me.applyColFilter();
                    },
                    error: function (err) { 
                        // console.log(err)
                    }
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
                                DELVDATE: aData.at(item).DELVDATE,
                                BASEPOQTY: aData.at(item).QTY,
                                ORDERPOQTY: (+aData.at(item).QTY) - (+aData.at(item).ORDERQTY),
                                SUPPLYTYPE: aData.at(item).SUPPLYTYPE,
                                ORDERQTY: aData.at(item).ORDERQTY,
                                BASEQTY: aData.at(item).QTY,
                                BASEUOM: aData.at(item).UNIT,
                                PLANMONTH: aData.at(item).PLANMONTH,
                                ITEM: '00000',
                                REMARKS: '',
                                INFORECCHECK: false,
                                INFOREC: ""
                            })
                        }
                    })

                    if (bProceed) {
                        this.showLoadingDialog('Processing...');
                        bProceed = true;

                        // console.log("before lock");
                        var bProceed = await this.lock(this);
                        if (!bProceed) return;
                        // console.log("after lock");
                        
                        this._oModel.read("/ZERPCheckSet", {
                            urlParameters: {
                                "$filter": "Sbu eq '" + vSBU + "'"
                            },
                            success: function (oDataCheck, oResponse) {                                
                                oSelectedIndices.forEach(item => {
                                    if (oDataCheck.results.length > 0) {
                                        if (oDataCheck.results.filter(fItem => fItem.Field2 === aData.at(item).MATERIALTYPE).length === 0) {
                                            oParamData.push({
                                                Vendor: aData.at(item).VENDOR,
                                                Material: aData.at(item).MATERIALNO,
                                                PurchOrg: aData.at(item).PURCHORG,
                                                PurGroup: aData.at(item).PURCHGRP,
                                                Plant: aData.at(item).PURCHPLANT
                                            })
                                        }
                                    }
                                    else {
                                        oParamData.push({
                                            Vendor: aData.at(item).VENDOR,
                                            Material: aData.at(item).MATERIALNO,
                                            PurchOrg: aData.at(item).PURCHORG,
                                            PurGroup: aData.at(item).PURCHGRP,
                                            Plant: aData.at(item).PURCHPLANT
                                        })
                                    }
                                })

                                // console.log(me._oCreateData)
                                if (oParamData.length > 0) {
                                    //get valid info record
                                    oParamData = oParamData.filter((value, index, self) => self.findIndex(item => item.Vendor === value.Vendor && item.Material === value.Material && item.PurchOrg === value.PurchOrg && item.PurGroup === value.PurGroup && item.Plant === value.Plant) === index) ;
            
                                    oParam['N_GetInfoRecMatParam'] = oParamData;
                                    oParam['N_GetInfoRecReturn'] = [];
                
                                    oModel.create("/GetInfoRecordSet", oParam, {
                                        method: "POST",
                                        success: function(oResult, oResponse) {
                                            oParamData.forEach(item => {
                                                var returnData = jQuery.extend(true, [], oResult.N_GetInfoRecReturn.results);

                                                returnData = returnData.filter(fItem => fItem.Vendor === item.Vendor && fItem.PurchOrg === item.PurchOrg && fItem.PurGroup === item.PurGroup && fItem.Material === item.Material);

                                                me._oCreateData.filter(fItem => fItem.VENDOR === item.Vendor && fItem.PURCHORG === item.PurchOrg && fItem.PURCHGRP === item.PurGroup && fItem.MATERIALNO === item.Material && fItem.PURCHPLANT === item.Plant)
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
                                                            itemIR.ORDERPOQTY = (itemIR.ORDERPOQTY / ((+returnData[0].ConvNum1) * (+returnData[0].ConvDen1) * (+returnData[0].PriceUnit))).toFixed(3);
                                                        }
                                                    });
                                            })

                                            // console.log(oResult.N_GetInfoRecReturn)
                                            oParamData = [];

                                            if (me._oCreateData.filter(fItem => fItem.REMARKS === '').length > 0) {
                                                //Check PO doc type for PR items with valid info records
                                                me._oModel.read("/PODocTypSet", {
                                                    success: function (oDataPODocTyp, oResponse) {
                                                        // console.log(oDataPODocTyp)
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

                                                            // // //FOR TESTING 
                                                            // oParamData.push({
                                                            //     DOCTYPE: item.DOCTYPE,
                                                            //     VENDOR: item.VENDOR,
                                                            //     PURCHORG: item.PURCHORG,
                                                            //     PURCHGRP: item.PURCHGRP,
                                                            //     COMPANY: item.COMPANY,
                                                            //     PURCHPLANT: item.PURCHPLANT,
                                                            //     SHIPTOPLANT: item.SHIPTOPLANT,
                                                            //     VENDORNAME: item.VENDORNAME                                                                
                                                            // })
                                                        })

                                                        //FOR TESTING, CHANGE TO LEN = 0
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
                                                            // console.log(me._oCreateData);
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
                                            // console.log(oData)
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

                                                // // //FOR TESTING 
                                                // oParamData.push({
                                                //     DOCTYPE: item.DOCTYPE,
                                                //     VENDOR: item.VENDOR,
                                                //     PURCHORG: item.PURCHORG,
                                                //     PURCHGRP: item.PURCHGRP,
                                                //     COMPANY: item.COMPANY,
                                                //     PURCHPLANT: item.PURCHPLANT,
                                                //     SHIPTOPLANT: item.SHIPTOPLANT,
                                                //     VENDORNAME: item.VENDORNAME                                                                
                                                // })
                                            })

                                            //FOR TESTING, CHANGE TO LEN = 0
                                            if (me._oCreateData.filter(fItem => fItem.REMARKS === '').length > 0) {
                                                var iCtr = 0;
                                                var aNOIR = me._oCreateData.filter(fItem => fItem.REMARKS === '');                                                
                                                console.log(aNOIR)

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
                                                            console.log(oDataNOIR)
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

                                                // me.closeLoadingDialog();
                                                
                                                // var oCreatePOHdr = oParamData.filter((value, index, self) => self.findIndex(item => item.DOCTYPE === value.DOCTYPE && item.VENDOR === value.VENDOR && item.PURCHORG === value.PURCHORG && item.PURCHGRP === value.PURCHGRP && item.COMPANY === value.COMPANY && item.PURCHPLANT === value.PURCHPLANT && item.SHIPTOPLANT === value.SHIPTOPLANT && item.VENDORNAME === value.VENDORNAME) === index) ;
                                                // var oCreatePODtls = me._oCreateData.filter(fItem => fItem.REMARKS === '');

                                                // //Add GROUP key
                                                // oCreatePOHdr.forEach((item, index) => {
                                                //     item.GROUP = (index + 1) + "";

                                                //     oCreatePODtls.filter(fItem => fItem.DOCTYPE === item.DOCTYPE && fItem.VENDOR === item.VENDOR && fItem.PURCHORG === item.PURCHORG && fItem.PURCHGRP === item.PURCHGRP && fItem.COMPANY === item.COMPANY && fItem.PURCHPLANT === item.PURCHPLANT && fItem.SHIPTOPLANT === item.SHIPTOPLANT)
                                                //         .forEach((rItem, rIndex) => { 
                                                //             rItem.GROUP = (index + 1) + "";

                                                //             var sItem = (10 * ( index + 1 )) + "";
                                                //             while (sItem.length < 5) sItem = "0" + sItem;

                                                //             rItem.ITEM = sItem;
                                                //         });
                                                // });
                                                // // console.log(oCreatePODtls)
                                                // me.getOwnerComponent().getModel("UI_MODEL").setData({sbu: me.getView().getModel("ui").getData().sbu})
                                                // me.getOwnerComponent().getModel("CREATEPO_MODEL").setData({
                                                //     header: oCreatePOHdr,
                                                //     detail: oCreatePODtls
                                                // })

                                                // var oRouter = sap.ui.core.UIComponent.getRouterFor(me);
                                                // oRouter.navTo("RouteCreatePO");
                                            }
                                            else {
                                                me.closeLoadingDialog();
                                                // console.log(me._oCreateData);
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
                // console.log(oCreatePODtls)
                this.getOwnerComponent().getModel("UI_MODEL").setData({sbu: this.getView().getModel("ui").getData().sbu})
                this.getOwnerComponent().getModel("CREATEPO_MODEL").setData({
                    header: oCreatePOHdr,
                    detail: oCreatePODtls
                })
                // console.log(oCreatePOHdr)
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
                        success: function(oResultLock) {
                            // console.log("Unlock", oResultLock)
                        },
                        error: function (err) {
                            me.closeLoadingDialog();
                            sap.m.MessageBox.information(err)
                        }
                    })
                }
            },

            showCreatePOResult() {
                // console.log(this._oCreateData)
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
                            // console.log("Lock", oResultLock);
                            oResultLock.N_LOCK_MESSAGES.results.forEach(item => {
                                if (item.Type === "E") {
                                    sError += item.Message + ". ";
                                }
                            })
                            
                            if (sError.length > 0) {
                                resolve(false);
                                sap.m.MessageBox.information(sError);
                                me.closeLoadingDialog();
                            }
                            else resolve(true);
                        },
                        error: function (err) {
                            me.closeLoadingDialog();
                            resolve(false);
                        }
                    });
                })

                return await promise;
            },

            unLock() {
                var oModelLock = this.getOwnerComponent().getModel("ZGW_3DERP_LOCK_SRV");
                var oParamUnLock = {};
                var me = this;

                oParamUnLock["N_IMPRTAB"] = this._oLock;
                
                oModelLock.create("/Unlock_PRSet", oParamUnLock, {
                    method: "POST",
                    success: function(oResultLock) {
                        // console.log("Unlock", oResultLock)
                    },
                    error: function (err) {
                        me.closeLoadingDialog();
                    }
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

        });
    });
