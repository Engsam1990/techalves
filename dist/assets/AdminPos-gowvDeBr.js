import{j as e}from"./query-A5u5b6Zn.js";import{r as u,X as ke,a2 as Ae,k as $e,D as qe,E as Re,F as Ie}from"./icons-BSl2UeLJ.js";import{L as De}from"./react-CGZTApT2.js";import{a as re}from"./adminApi-BevV4o-E.js";import{f as g}from"./products-BzvMkjSF.js";import{B as I,z as ve,C as Z,e as F,f as ee,g as te}from"./index-BP7YVP7u.js";import{I as $}from"./input-NcJNM6rI.js";import{L as y}from"./label-D6x208MY.js";import{S as pe,a as xe,b as he,c as fe,d as oe}from"./select-Cc1-K93J.js";import{D as Te,a as Oe,b as Ee,c as Le,d as Qe,f as Be}from"./dropdown-menu-BB4I-4Of.js";import{T as ce}from"./textarea-P2dTZPcJ.js";import{S as ze}from"./skeleton-BbvmNgy-.js";import{C as Ue}from"./checkbox-BwuaD-Wl.js";import{s as T}from"./site-B6PVLhN1.js";import{D as Ve,a as We,b as _e,c as He,d as Ke,e as Xe}from"./dialog-D077hivk.js";import"./ui-BUWvRZre.js";import"./index-MUNfN6Yp.js";import"./Combination-B7qw03Df.js";import"./index-D43Sm7Iu.js";import"./index-Cwx6GtKf.js";import"./index-CxeI5dQW.js";const Ye=({items:n,orderSummary:d,saleForm:c,totalAmount:b,onClose:r})=>{const j=u.useRef(null),P=b,q=Math.max(0,Number(d?.discountAmount??c.discountAmount??0)),N=Math.max(0,Number(d?.otherCharges??c.otherCharges??0)),E=Math.max(0,P-q+N),h=Math.max(0,Number(d?.vatAmount??(c.vatEnabled?Math.round(E*(Number(c.vatRate||16)/100)):0))),k=E+h,i=q>0,S=N>0,v=h>0,B=()=>{if(j.current){const C=window.open("","","height=600,width=800");C&&(C.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>POS Receipt</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #fff;
                }
                .receipt {
                  max-width: 400px;
                  margin: 0 auto;
                  border: 1px solid #ddd;
                  padding: 20px;
                  background-color: #fff;
                }
                .header {
                  text-align: center;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 18px;
                  font-weight: bold;
                }
                .header p {
                  margin: 5px 0;
                  font-size: 12px;
                  color: #666;
                }
                .order-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #ddd;
                }
                .order-info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .items-section {
                  margin-bottom: 15px;
                }
                .items-header {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  font-weight: bold;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 5px;
                  margin-bottom: 10px;
                }
                .item {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-bottom: 8px;
                }
                .item-left {
                  flex: 1;
                }
                .item-right {
                  text-align: right;
                  margin-left: 10px;
                }
                .item-name {
                  font-weight: 500;
                }
                .item-details {
                  font-size: 11px;
                  color: #666;
                }
                .totals {
                  margin: 15px 0;
                  padding: 10px 0;
                  border-top: 1px solid #ddd;
                  border-bottom: 2px solid #000;
                }
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin: 5px 0;
                }
                .total-row.grand-total {
                  font-size: 14px;
                  font-weight: bold;
                  margin-top: 10px;
                }
                .payment-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #ddd;
                }
                .payment-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .customer-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px dashed #ddd;
                }
                .customer-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .footer {
                  text-align: center;
                  font-size: 11px;
                  color: #666;
                  margin-top: 15px;
                }
                .divider {
                  border-bottom: 1px dashed #ddd;
                  margin: 10px 0;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  .receipt {
                    border: none;
                    max-width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h1>${T.businessName}</h1>
                  <p>${T.location}</p>
                  <p>${T.businessHours}</p>
                  <p>${T.supportPhoneDisplay}</p>
                </div>

                <div class="order-info">
                  <div class="order-info-row">
                    <span>Receipt ID:</span>
                    <span>#${String(d?.id||"").slice(0,8).toUpperCase()}</span>
                  </div>
                  <div class="order-info-row">
                    <span>Date:</span>
                    <span>${new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div class="items-section">
                  <div class="items-header">
                    <span style="flex: 1">Item</span>
                    <span style="width: 40px">Qty</span>
                    <span style="width: 60px; text-align: right">Total</span>
                  </div>
                  ${n.map(R=>`
                    <div class="item">
                      <div class="item-left">
                        <div class="item-name">${R.product.name}</div>
                        <div class="item-details">
                          ${R.product.brand}${R.product.brand?" • ":""}
                          ${g(R.product.price)} each
                        </div>
                        
                      </div>
                      <div class="item-right">
                        <div style="width: 40px; text-align: center">${R.quantity}</div>
                        <div style="width: 60px; text-align: right">${g(R.product.price*R.quantity)}</div>
                      </div>
                    </div>
                  `).join("")}
                </div>

                <div class="totals">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${g(P)}</span>
                  </div>
                  <div class="total-row">
                    <span>Discount:</span>
                    <span>${i?`-${g(q)}`:"No"}</span>
                  </div>
                  <div class="total-row" style="font-size: 11px;">
                    <span>Other charges:</span>
                    <span>${S?`+${g(N)}`:"No"}</span>
                  </div>
                  <div class="total-row" style="font-size: 11px;">
                    <span>VAT:</span>
                    <span>${v?g(h):"No"}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span>TOTAL:</span>
                    <span>${g(k)}</span>
                  </div>
                </div>

                <div class="payment-info">
                  <div class="payment-row">
                    <span>Method:</span>
                    <span>${String(c.paymentMethod).replace(/_/g," ").toUpperCase()}</span>
                  </div>
                  <div class="payment-row">
                    <span>Status:</span>
                    <span>${String(c.paymentStatus).toUpperCase()}</span>
                  </div>
                  ${c.transactionReference?`
                    <div class="payment-row">
                      <span>Reference:</span>
                      <span>${c.transactionReference}</span>
                    </div>
                  `:""}
                </div>

                ${c.customerName||c.customerPhone?`
                  <div class="customer-info">
                    ${c.customerName?`<div class="customer-row"><span>Customer:</span><span>${c.customerName}</span></div>`:""}
                    ${c.customerPhone?`<div class="customer-row"><span>Phone:</span><span>${c.customerPhone}</span></div>`:""}
                  </div>
                `:""}

                <div class="footer">
                  <p>Thank you for your purchase!</p>
                  <p>${T.businessName}</p>
                </div>
              </div>
            </body>
          </html>
        `),C.document.close(),C.print())}};return e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",children:e.jsxs("div",{className:"w-full max-w-md rounded-lg bg-white shadow-lg",children:[e.jsxs("div",{className:"flex items-center justify-between border-b p-4",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"POS Receipt"}),e.jsx("button",{onClick:r,className:"rounded-lg p-1 hover:bg-muted",children:e.jsx(ke,{className:"h-5 w-5"})})]}),e.jsxs("div",{ref:j,className:"max-h-[60vh] overflow-y-auto bg-white p-6 text-xs",style:{fontFamily:"monospace"},children:[e.jsxs("div",{className:"space-y-2 text-center",children:[e.jsx("h3",{className:"text-sm font-bold",children:T.businessName}),e.jsx("p",{className:"text-xs text-muted-foreground",children:T.location}),e.jsx("p",{className:"text-xs text-muted-foreground",children:T.businessHours}),e.jsx("p",{className:"text-xs text-muted-foreground",children:T.supportPhoneDisplay})]}),e.jsxs("div",{className:"my-2 border-t border-b py-2 text-xs",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Receipt ID:"}),e.jsxs("span",{className:"font-semibold",children:["#",String(d?.id||"").slice(0,8).toUpperCase()]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Date:"}),e.jsx("span",{children:new Date().toLocaleString()})]})]}),e.jsxs("div",{className:"my-3 space-y-2 text-xs",children:[e.jsxs("div",{className:"flex justify-between border-b pb-1 text-xs font-semibold",children:[e.jsx("span",{style:{flex:1},children:"Item"}),e.jsx("span",{style:{width:"40px"},children:"Qty"}),e.jsx("span",{style:{width:"60px",textAlign:"right"},children:"Total"})]}),n.map(C=>e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium",children:C.product.name}),e.jsx("span",{children:g(C.product.price*C.quantity)})]}),e.jsxs("div",{className:"text-xs text-muted-foreground",children:[C.product.brand," • ",g(C.product.price)," x"," ",C.quantity]})]},C.product.id))]}),e.jsxs("div",{className:"my-3 border-t border-b py-2 text-xs font-semibold",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Subtotal:"}),e.jsx("span",{children:g(P)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Discount:"}),e.jsx("span",{children:i?`-${g(q)}`:"No"})]}),e.jsxs("div",{className:"mt-1 flex justify-between text-xs",children:[e.jsx("span",{children:"Other charges:"}),e.jsx("span",{children:S?`+${g(N)}`:"No"})]}),e.jsxs("div",{className:"mt-1 flex justify-between text-xs",children:[e.jsx("span",{children:"VAT:"}),e.jsx("span",{children:v?g(h):"No"})]}),e.jsxs("div",{className:"mt-1 flex justify-between text-sm",children:[e.jsx("span",{children:"TOTAL:"}),e.jsx("span",{className:"text-base text-primary",children:g(k)})]})]}),e.jsxs("div",{className:"my-2 space-y-1 text-xs",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Payment Method:"}),e.jsx("span",{className:"font-medium",children:String(c.paymentMethod).replace(/_/g," ").toUpperCase()})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Status:"}),e.jsx("span",{className:"font-medium",children:String(c.paymentStatus).toUpperCase()})]}),c.transactionReference&&e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Reference:"}),e.jsx("span",{className:"font-medium",children:c.transactionReference})]})]}),(c.customerName||c.customerPhone)&&e.jsxs("div",{className:"my-2 border-t border-b py-2 text-xs",children:[c.customerName&&e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Customer:"}),e.jsx("span",{children:c.customerName})]}),c.customerPhone&&e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Phone:"}),e.jsx("span",{children:c.customerPhone})]})]}),e.jsxs("div",{className:"mt-4 text-center text-xs text-muted-foreground",children:[e.jsx("p",{children:"Thank you for your purchase!"}),e.jsx("p",{className:"mt-1",children:T.businessName})]})]}),e.jsxs("div",{className:"flex gap-2 border-t p-4",children:[e.jsx(I,{onClick:B,className:"flex-1",variant:"highlight",children:"Print Receipt"}),e.jsx(I,{onClick:r,className:"flex-1",variant:"outline",children:"Close"})]})]})})},U="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",ge={name:"",categoryId:"",subcategory:"",brand:"",barcode:"",condition:"new",description:"",warrantyText:"",sourceId:"",sourcePrice:0,sellingPrice:0,sourcePaymentStatus:"pending",quantity:1,serialNumbersText:""};function Ge(n){return n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)||"instant-sale-product"}function Je(n){return Array.from(new Set(String(n||"").split(/\r?\n|,/).map(d=>d.trim()).filter(Boolean)))}function se(n){return n.isActive!==!1}function Ze({open:n,onOpenChange:d,onCreated:c}){const{toast:b}=ve(),[r,j]=u.useState(ge),[P,q]=u.useState([]),[N,E]=u.useState({}),[h,k]=u.useState(!1),i=u.useMemo(()=>P.filter(se),[P]),S=u.useMemo(()=>(N.categories||[]).filter(se),[N.categories]),v=u.useMemo(()=>(N.brands||[]).filter(se),[N.brands]),B=u.useMemo(()=>(N.subcategories||[]).filter(a=>se(a)&&a.categoryId===r.categoryId),[N.subcategories,r.categoryId]),C=v.find(a=>a.id===r.brand),R=()=>j(ge);u.useEffect(()=>{if(!n){R();return}let a=!0;return k(!0),Promise.all([re.getSources({active:"1"}),re.getCatalog()]).then(([o,A])=>{a&&(q(Array.isArray(o)?o:[]),E({categories:Array.isArray(A?.categories)?A.categories:[],subcategories:Array.isArray(A?.subcategories)?A.subcategories:[],brands:Array.isArray(A?.brands)?A.brands:[]}))}).catch(o=>{a&&b({title:"Could not load POS options",description:o.message||"Confirm suppliers, categories, subcategories, and brands are available.",variant:"destructive"})}).finally(()=>{a&&k(!1)}),()=>{a=!1}},[n,b]);const ne=()=>{const a=r.name.trim(),o=Number(r.sourcePrice||0),A=Number(r.sellingPrice||0);if(!a)return b({title:"Product name required",description:"Enter the instant-sale product name.",variant:"destructive"});if(!r.categoryId)return b({title:"Category required",description:"Select the product category.",variant:"destructive"});if(!r.brand)return b({title:"Brand required",description:"Select the product brand.",variant:"destructive"});if(!r.sourceId)return b({title:"Supplier/source required",description:"Select the supplier/source.",variant:"destructive"});if(o<=0)return b({title:"Source price required",description:"Enter the supplier/source price.",variant:"destructive"});if(A<=0)return b({title:"Selling price required",description:"Enter the customer selling price.",variant:"destructive"});if(!r.sourcePaymentStatus)return b({title:"Source payment status required",variant:"destructive"});const V=Number(r.quantity||0);if(!Number.isFinite(V)||V<1)return b({title:"Quantity required",description:"Enter at least 1 unit for the instant-sale product.",variant:"destructive"});const z=Je(r.serialNumbersText),w=z.length?z.length:Math.max(1,Number(r.quantity||1)),D={name:a,categoryId:r.categoryId,subcategory:r.subcategory||null,brand:r.brand,barcode:r.barcode.trim()||null,condition:r.condition,description:r.description.trim()||null,warrantyText:r.warrantyText.trim()||null,sourceId:r.sourceId,sourcePrice:o,sellingPrice:A,sourcePaymentStatus:r.sourcePaymentStatus},W=`instant-${Date.now()}`;c({id:W,name:a,slug:`${Ge(a)}-${W.slice(-6)}`,brand:C?.name||"Instant sale",barcode:r.barcode.trim()||null,price:A,stockQuantity:w,inStock:!0,images:[],availableSerialNumbers:z,sourceId:r.sourceId,sourcePrice:o,sourcePaymentStatus:r.sourcePaymentStatus,instantProduct:D},w,z),d(!1)};return e.jsx(Ve,{open:n,onOpenChange:d,children:e.jsxs(We,{className:"max-h-[90vh] overflow-y-auto sm:max-w-2xl",children:[e.jsxs(_e,{children:[e.jsx(He,{children:"Add instant-sale product"}),e.jsx(Ke,{children:"POS-only product. It is hidden from catalogue/admin product listing, and sourced by is recorded as the logged-in data entrant."})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsxs(y,{children:["Product name ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx($,{value:r.name,onChange:a=>j(o=>({...o,name:a.target.value})),placeholder:"Example: Used Dell Latitude charger"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Category ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs("select",{className:U,value:r.categoryId,onChange:a=>j(o=>({...o,categoryId:a.target.value,subcategory:""})),disabled:h||!S.length,children:[e.jsx("option",{value:"",children:h?"Loading categories...":S.length?"Select category":"No categories found"}),S.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Subcategory"}),e.jsxs("select",{className:U,value:r.subcategory,onChange:a=>j(o=>({...o,subcategory:a.target.value})),disabled:h||!r.categoryId||!B.length,children:[e.jsx("option",{value:"",children:r.categoryId?B.length?"No subcategory":"No subcategories for category":"Choose category first"}),B.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Brand ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs("select",{className:U,value:r.brand,onChange:a=>j(o=>({...o,brand:a.target.value})),disabled:h||!v.length,children:[e.jsx("option",{value:"",children:h?"Loading brands...":v.length?"Select brand":"No brands found"}),v.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Barcode"}),e.jsx($,{value:r.barcode,onChange:a=>j(o=>({...o,barcode:a.target.value})),placeholder:"Optional barcode"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Condition"}),e.jsxs("select",{className:U,value:r.condition,onChange:a=>j(o=>({...o,condition:a.target.value})),children:[e.jsx("option",{value:"new",children:"New"}),e.jsx("option",{value:"refurbished",children:"Refurbished"}),e.jsx("option",{value:"ex-uk",children:"Ex-UK"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Supplier / source ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs("select",{className:U,value:r.sourceId,onChange:a=>j(o=>({...o,sourceId:a.target.value})),disabled:h||!i.length,children:[e.jsx("option",{value:"",children:h?"Loading suppliers...":i.length?"Select supplier/source":"No suppliers found"}),i.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Source price ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx($,{type:"number",min:1,value:r.sourcePrice,onChange:a=>j(o=>({...o,sourcePrice:Number(a.target.value)||0}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Selling price ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx($,{type:"number",min:1,value:r.sellingPrice,onChange:a=>j(o=>({...o,sellingPrice:Number(a.target.value)||0}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Source payment status ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs("select",{className:U,value:r.sourcePaymentStatus,onChange:a=>j(o=>({...o,sourcePaymentStatus:a.target.value})),children:[e.jsx("option",{value:"pending",children:"Pending"}),e.jsx("option",{value:"paid",children:"Paid"}),e.jsx("option",{value:"partial",children:"Partial"}),e.jsx("option",{value:"waived",children:"Waived"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Quantity ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx($,{required:!0,type:"number",min:1,value:r.quantity,onChange:a=>j(o=>({...o,quantity:Math.max(1,Number(a.target.value)||1)}))})]}),e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(y,{children:"Serial numbers"}),e.jsx(ce,{value:r.serialNumbersText,onChange:a=>j(o=>({...o,serialNumbersText:a.target.value})),placeholder:"Optional. One serial number per line or comma-separated.",rows:4}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"When serials are entered, quantity is set from the number of serials."})]}),e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(y,{children:"Description"}),e.jsx(ce,{value:r.description,onChange:a=>j(o=>({...o,description:a.target.value})),placeholder:"Optional internal/product note",rows:3})]})]}),e.jsxs(Xe,{children:[e.jsx(I,{type:"button",variant:"outline",onClick:()=>d(!1),children:"Cancel"}),e.jsx(I,{type:"button",onClick:ne,children:"Add to sale"})]})]})})}const be=[{value:"cash",label:"Cash"},{value:"mpesa",label:"M-Pesa"},{value:"card",label:"Card"},{value:"bank_transfer",label:"Bank transfer"},{value:"other",label:"Other"}],de=new Set(["mpesa","card","bank_transfer"]),Fe={paymentStatus:"paid",paymentMethod:"cash",transactionReference:"",discountAmount:0,otherCharges:0,customerName:"",customerPhone:"",note:"",vatEnabled:!1,vatRate:16};function et(n,d){const c=String(n.name||"").toLowerCase(),b=String(n.brand||"").toLowerCase(),r=String(n.barcode||"").toLowerCase(),j=String(n.slug||"").toLowerCase(),P=String(n.id||"").toLowerCase();return d?r&&r===d?120:j===d||P===d||c===d?100:r.startsWith(d)?80:c.startsWith(d)?60:b.startsWith(d)?40:[c,b,r,j,P].some(q=>q.includes(d))?20:0:0}function je(n,d){return n instanceof Error?n.message:d}function tt(n,d){return de.has(n)&&d==="paid"}function ye(n){return n&&typeof n=="object"&&"serialNumber"in n?String(n.serialNumber||""):String(n||"")}function O(n){return Array.from(new Set((n.availableSerialNumbers||[]).map(ye).map(d=>d.trim()).filter(Boolean)))}function ae(n,d,c){return c?Array.from(new Set(n.map(b=>b.trim()).filter(Boolean))).slice(0,d):[]}function st(n,d,c){if(!O(n).length)return!0;const b=Array.from(new Set(c.map(r=>r.trim()).filter(Boolean)));return b.length>0&&b.length===d}const wt=()=>{const{toast:n}=ve(),d=u.useRef(null),[c,b]=u.useState(!0),[r,j]=u.useState(!1),[P,q]=u.useState([]),[N,E]=u.useState(""),[h,k]=u.useState([]),[i,S]=u.useState(Fe),[v,B]=u.useState(null),[C,R]=u.useState(!1),[ne,a]=u.useState(!1),[o,A]=u.useState(null),[V,z]=u.useState({});u.useEffect(()=>{let t=!0;return(async()=>{b(!0);try{const x=await re.getProducts();t&&q(Array.isArray(x)?x:[])}catch(x){t&&n({title:"Error",description:je(x,"Could not load products for POS"),variant:"destructive"})}finally{t&&b(!1)}})(),()=>{t=!1}},[n]),u.useEffect(()=>{c||d.current?.focus()},[c]);const w=u.useMemo(()=>{const t=N.trim().toLowerCase();if(!t)return null;const s=P.filter(p=>String(p.barcode||"").trim().toLowerCase()===t);if(s.length===1)return s[0];const x=P.filter(p=>String(p.name||"").trim().toLowerCase()===t);return x.length===1?x[0]:null},[P,N]),D=u.useMemo(()=>{const t=N.trim().toLowerCase();return t?[...P].map(s=>({product:s,score:et(s,t)})).filter(s=>s.score>0).sort((s,x)=>x.score-s.score||s.product.name.localeCompare(x.product.name)).slice(0,8).map(s=>s.product):[]},[P,N]),W=u.useMemo(()=>h.reduce((t,s)=>t+s.quantity,0),[h]),_=u.useMemo(()=>h.reduce((t,s)=>t+s.product.price*s.quantity,0),[h]),H=u.useMemo(()=>Math.min(Math.max(Number(i.discountAmount||0),0),_),[i.discountAmount,_]),K=u.useMemo(()=>Math.max(0,Number(i.otherCharges||0)),[i.otherCharges]),Y=u.useMemo(()=>Math.max(0,_-H+K),[H,K,_]),G=u.useMemo(()=>i.vatEnabled?Math.round(Y*(Number(i.vatRate||16)/100)):0,[i.vatEnabled,i.vatRate,Y]),Ne=u.useMemo(()=>Y+G,[Y,G]);u.useMemo(()=>h.filter(t=>O(t.product).length>0).length,[h]);const ue=u.useMemo(()=>de.has(i.paymentMethod),[i.paymentMethod]),ie=u.useMemo(()=>tt(i.paymentMethod,i.paymentStatus),[i.paymentMethod,i.paymentStatus]),L=()=>{d.current?.focus(),d.current?.select()},J=t=>{if(!t.inStock||Number(t.stockQuantity||0)<=0){n({title:"Out of stock",description:`${t.name} is not available right now`,variant:"destructive"}),L();return}let s=!1;if(k(x=>{const p=x.find(m=>m.product.id===t.id);if(!p)return[...x,{product:t,quantity:O(t).length>0?0:1,serialNumbers:ae([],O(t).length>0?0:1,O(t).length>0)}];if(O(t).length>0)return x;const l=p.quantity+1;return l>Number(t.stockQuantity||0)?(s=!0,x):x.map(m=>{if(m.product.id!==t.id)return m;const f=ae(m.serialNumbers,l,O(m.product).length>0);return{...m,quantity:l,serialNumbers:f}})}),s){n({title:"Stock limit reached",description:`Only ${t.stockQuantity} unit(s) available for ${t.name}`,variant:"destructive"}),L();return}E(""),L()},Se=(t,s,x=[])=>{const p=Array.from(new Set(x.map(f=>f.trim()).filter(Boolean))),l=p.length?p.length:Math.max(1,Number(s||1)),m={...t,stockQuantity:Math.max(Number(t.stockQuantity||0),l),inStock:!0,availableSerialNumbers:p.length?p:t.availableSerialNumbers||[]};q(f=>[m,...f.filter(M=>M.id!==m.id)]),k(f=>[...f.filter(M=>M.product.id!==m.id),{product:m,quantity:l,serialNumbers:p}]),E(""),L()},we=t=>{t.preventDefault();const s=w||(D.length===1?D[0]:null);if(!s){n({title:D.length>1?"Multiple products found":"Product not found",description:D.length>1?"Select the correct product from the results below.":"Scan the barcode or type the exact product name.",variant:"destructive"}),L();return}J(s)},me=(t,s)=>{if(s<=0){k(x=>x.filter(p=>p.product.id!==t)),L();return}k(x=>x.map(p=>{if(p.product.id!==t)return p;const l=Math.min(s,Number(p.product.stockQuantity||0));return{...p,quantity:l,serialNumbers:ae(p.serialNumbers,l,O(p.product).length>0)}}))},Ce=t=>{k(s=>s.filter(x=>x.product.id!==t)),L()},Pe=(t,s,x)=>{k(p=>p.map(l=>{if(l.product.id!==t)return l;const m=O(l.product).length,f=ae(l.serialNumbers,m,m>0);if(x){if(f.includes(s)||f.length>=m)return l;const Q=[...f,s];return{...l,serialNumbers:Q,quantity:Q.length}}const M=f.filter(Q=>Q!==s);return{...l,serialNumbers:M,quantity:M.length}}))},Me=async()=>{if(W<=0){n({title:"No products selected",description:"Scan or add at least one product before recording a sale.",variant:"destructive"}),L();return}if(ie&&!i.transactionReference.trim()){n({title:"Transaction reference required",description:"Enter the payment transaction reference for paid M-Pesa, card, or bank transfer sales.",variant:"destructive"});return}const t=h.find(s=>!st(s.product,s.quantity,s.serialNumbers));if(t){n({title:"Serial numbers required",description:`Select a serial number for each unit of ${t.product.name} before checkout.`,variant:"destructive"});return}j(!0);try{const s=await re.createPosSale({items:h.map(l=>l.product.instantProduct?{quantity:l.quantity,serialNumbers:l.serialNumbers.map(m=>m.trim()).filter(Boolean),instantProduct:l.product.instantProduct}:{productId:l.product.id,quantity:l.quantity,serialNumbers:l.serialNumbers.map(m=>m.trim()).filter(Boolean)}),paymentStatus:i.paymentStatus,paymentMethod:i.paymentMethod,transactionReference:ue&&i.transactionReference.trim()||void 0,discountAmount:H,otherCharges:K,customerName:i.customerName.trim()||void 0,customerPhone:i.customerPhone.trim()||void 0,note:i.note.trim()||void 0,vatEnabled:!!i.vatEnabled,vatRate:Number(i.vatRate||16)}),x=new Map(h.map(l=>[l.product.id,l.quantity])),p=new Map(h.map(l=>[l.product.id,new Set(l.serialNumbers)]));q(l=>l.map(m=>{const f=x.get(m.id);if(!f)return m;const M=Math.max(0,Number(m.stockQuantity||0)-f),Q=p.get(m.id)||new Set,le=(m.availableSerialNumbers||[]).map(X=>ye(X)).filter(X=>!!X).filter(X=>!Q.has(X));return{...m,stockQuantity:M,inStock:M>0,availableSerialNumbers:le}})),A({items:h.map(({product:l,quantity:m,serialNumbers:f})=>({product:l,quantity:m,serialNumbers:f})),orderSummary:s.order||null,saleForm:i,totalAmount:_}),R(!0),k([]),E(""),S(l=>({...l,transactionReference:"",discountAmount:0,otherCharges:0,customerName:"",customerPhone:"",note:"",vatEnabled:l.vatEnabled,vatRate:l.vatRate})),B(s.order||null),n({title:"Sale recorded",description:s.message||"POS sale saved successfully"})}catch(s){n({title:"Error",description:je(s,"Could not record POS sale"),variant:"destructive"})}finally{j(!1)}};return c?e.jsx(ze,{className:"h-[560px] w-full rounded-xl"}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-display font-bold",children:"POS"}),e.jsx("p",{className:"text-muted-foreground",children:"Scan a barcode or search by product name, then record the sale and update stock immediately."})]}),e.jsxs("div",{className:"grid gap-6 xl:grid-cols-[1.15fr_0.85fr]",children:[e.jsxs("div",{className:"space-y-6",children:[e.jsxs(Z,{children:[e.jsx(F,{children:e.jsxs(ee,{className:"flex items-center gap-2 text-lg",children:[e.jsx(Ae,{className:"h-5 w-5"}),"Scan Or Search"]})}),e.jsxs(te,{className:"space-y-4",children:[e.jsxs("form",{className:"flex flex-col gap-3 md:flex-row",onSubmit:we,children:[e.jsx($,{ref:d,value:N,onChange:t=>E(t.target.value),onKeyDown:t=>{if(t.key!=="Enter")return;const s=w||(D.length===1?D[0]:null);s&&(t.preventDefault(),J(s))},placeholder:"Scan barcode or type product name",className:"md:flex-1"}),e.jsxs("div",{className:"flex gap-2 md:w-auto",children:[e.jsx(I,{type:"submit",className:"flex-1 md:flex-none",children:"Add to sale"}),e.jsx(I,{type:"button",variant:"secondary",className:"flex-1 md:flex-none",onClick:()=>a(!0),children:"Add instant sale"})]})]}),e.jsx("div",{className:"rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground",children:"Scanner tip: most barcode scanners type the code and press Enter automatically, so this field is ready for scan-and-add."}),N.trim()?e.jsx("div",{className:"space-y-3",children:w?e.jsxs("button",{type:"button",onClick:()=>J(w),className:"flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40",children:[e.jsx("div",{children:w.images?.[0]?e.jsx("img",{src:w.images[0],alt:w.name,className:"h-16 w-16 rounded-lg border object-cover"}):null}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"font-medium",children:w.name}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:[w.brand,w.barcode?` • ${w.barcode}`:""]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"font-medium",children:g(w.price)}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[w.stockQuantity," in stock"]})]})]},w.id):D.length?e.jsxs(e.Fragment,{children:[D.length>1?e.jsx("div",{className:"rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground",children:"Multiple products match this search. Select the correct one below."}):null,e.jsx("div",{className:"space-y-2",children:D.map(t=>e.jsxs("button",{type:"button",onClick:()=>J(t),className:"flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40",children:[e.jsx("div",{children:t.images?.[0]?e.jsx("img",{src:t.images[0],alt:t.name,className:"h-16 w-16 rounded-lg border object-cover"}):null}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"font-medium",children:t.name}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:[t.brand,t.barcode?` • ${t.barcode}`:""]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"font-medium",children:g(t.price)}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[t.stockQuantity," in stock"]})]})]},t.id))})]}):e.jsx("div",{className:"rounded-lg border border-dashed p-4 text-sm text-muted-foreground",children:"No matching products found for this barcode or product name."})}):null]})]}),e.jsxs(Z,{children:[e.jsx(F,{children:e.jsxs(ee,{className:"flex items-center gap-2 text-lg",children:[e.jsx($e,{className:"h-5 w-5"}),"Current Sale",e.jsx("span",{className:"ml-auto text-sm font-normal text-destructive",children:"* Items required"})]})}),e.jsx(te,{className:"space-y-4",children:h.length?e.jsx("div",{className:"space-y-2.5",children:h.map(t=>{const s=O(t.product),x=t.serialNumbers.filter(Boolean).length,p=s.length>0,l=String(V[t.product.id]||"").trim().toLowerCase(),m=l?s.filter(f=>f.toLowerCase().includes(l)):s;return e.jsx("div",{className:"overflow-hidden rounded-lg border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md",children:e.jsxs("div",{className:"flex items-start gap-2.5",children:[t.product.images?.[0]?e.jsx("img",{src:t.product.images[0],alt:t.product.name,className:"h-12 w-12 shrink-0 rounded-md border object-cover"}):e.jsx("div",{className:"flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-center text-[9px] leading-tight text-muted-foreground",children:"No image"}),e.jsxs("div",{className:"min-w-0 flex-1 space-y-1.5",children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"truncate text-xs font-semibold leading-4",children:t.product.name}),e.jsxs("p",{className:"truncate text-[11px] leading-4 text-muted-foreground",children:[t.product.brand,t.product.barcode?` • ${t.product.barcode}`:""]}),!p&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"rounded-full bg-muted mx-1 px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:"Std"}),e.jsxs("span",{className:"rounded-full bg-muted mx-1 px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:["Stock ",t.product.stockQuantity]})]})]}),e.jsxs("div",{className:"text-right",children:[!p&&e.jsx("div",{className:"flex items-center justify-between gap-2 px-2 py-1.5",children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(I,{type:"button",variant:"outline",className:"h-7 w-7 rounded-full p-0",onClick:()=>me(t.product.id,t.quantity-1),children:e.jsx(qe,{className:"h-3 w-3"})}),e.jsx("div",{className:"min-w-6 text-center text-xs font-semibold",children:t.quantity}),e.jsx(I,{type:"button",variant:"outline",className:"h-7 w-7 rounded-full p-0",onClick:()=>me(t.product.id,t.quantity+1),disabled:t.quantity>=t.product.stockQuantity,children:e.jsx(Re,{className:"h-3 w-3"})})]})}),e.jsxs("p",{className:"text-xs font-semibold leading-4",children:[g(t.product.price)," * ",`${t.quantity} pcs`]}),e.jsx("p",{className:"max-w-[140px] text-[14px] leading-4 text-muted-foreground",children:g(t.product.price*t.quantity)})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-1.5",children:[p&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:"Serial"}),e.jsxs("span",{className:"rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:["Stock ",t.product.stockQuantity]})]}),p&&t.serialNumbers.length?e.jsx("span",{className:"max-w-[180px] truncate rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:t.serialNumbers.join(", ")}):null]}),p&&e.jsxs(Te,{children:[e.jsx(Oe,{asChild:!0,children:e.jsxs(I,{type:"button",variant:"outline",className:"h-7 w-full justify-between px-2 text-[11px]",children:[e.jsx("span",{children:"Serials"}),e.jsx("span",{className:"max-w-[180px] truncate text-[10px] text-muted-foreground",children:t.serialNumbers.length?t.serialNumbers.join(", "):"Select serials"})]})}),e.jsx(Ee,{align:"start",className:"w-80",children:e.jsxs("div",{className:"space-y-2 p-2",children:[e.jsx(Le,{className:"px-0",children:"Choose serial numbers"}),e.jsx($,{value:V[t.product.id]||"",onChange:f=>z(M=>({...M,[t.product.id]:f.target.value})),placeholder:"Search serial numbers",className:"h-8"}),e.jsx(Qe,{}),e.jsx("div",{className:"max-h-56 space-y-1 overflow-y-auto",children:m.length?m.map(f=>{const M=t.serialNumbers.includes(f),Q=!M&&x>=s.length;return e.jsxs(Be,{disabled:Q,onSelect:le=>{le.preventDefault(),Pe(t.product.id,f,!M)},className:"flex cursor-pointer items-center justify-between",children:[e.jsx("span",{children:f}),M?e.jsx("span",{className:"text-xs text-primary",children:"Selected"}):null]},`${t.product.id}-serial-${f}`)}):e.jsx("div",{className:"px-2 py-2 text-sm text-muted-foreground",children:"No matching serials found"})})]})})]})]}),e.jsx(I,{type:"button",variant:"ghost",size:"icon",className:"h-7 w-7 shrink-0",onClick:()=>Ce(t.product.id),children:e.jsx(Ie,{className:"h-3.5 w-3.5 text-destructive"})})]})},t.product.id)})}):e.jsx("div",{className:"rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"font-medium text-foreground",children:"No products in this sale yet"}),e.jsx("p",{children:"Scan a barcode or search above to add items to the current sale."})]})})})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs(Z,{children:[e.jsx(F,{children:e.jsx(ee,{className:"text-lg",children:"Payment And Checkout"})}),e.jsxs(te,{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 xl:grid-cols-1",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Payment status",e.jsx("span",{className:"ml-1 text-destructive",children:"*"})]}),e.jsxs(pe,{value:i.paymentStatus,onValueChange:t=>S(s=>({...s,paymentStatus:t})),children:[e.jsx(xe,{children:e.jsx(he,{})}),e.jsxs(fe,{children:[e.jsx(oe,{value:"paid",children:"Paid"}),e.jsx(oe,{value:"pending",children:"Pending"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Payment method",e.jsx("span",{className:"ml-1 text-destructive",children:"*"})]}),e.jsxs(pe,{value:i.paymentMethod,onValueChange:t=>S(s=>({...s,paymentMethod:t,transactionReference:de.has(t)?s.transactionReference:""})),children:[e.jsx(xe,{children:e.jsx(he,{})}),e.jsx(fe,{children:be.map(t=>e.jsx(oe,{value:t.value,children:t.label},t.value))})]})]})]}),ue?e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Transaction reference",ie?e.jsx("span",{className:"ml-1 text-destructive",children:"*"}):null]}),e.jsx($,{value:i.transactionReference,onChange:t=>S(s=>({...s,transactionReference:t.target.value})),placeholder:"Enter M-Pesa, card, or bank reference"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:ie?"Required because this sale is marked as paid.":"Optional while the payment is still pending."})]}):null,e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Customer name"}),e.jsx($,{value:i.customerName,onChange:t=>S(s=>({...s,customerName:t.target.value})),placeholder:"Optional walk-in customer name"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Customer phone"}),e.jsx($,{value:i.customerPhone,onChange:t=>S(s=>({...s,customerPhone:t.target.value})),placeholder:"Optional phone number"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Sale note"}),e.jsx(ce,{value:i.note,onChange:t=>S(s=>({...s,note:t.target.value})),placeholder:"Optional internal note for this POS sale",rows:4})]}),e.jsxs("div",{className:"rounded-xl border bg-muted/40 p-4",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Items"}),e.jsx("span",{children:W})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-between text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Payment"}),e.jsx("span",{children:be.find(t=>t.value===i.paymentMethod)?.label})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-between gap-3 text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Discount"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx($,{type:"number",min:"0",step:"0.01",value:i.discountAmount,onChange:t=>S(s=>({...s,discountAmount:Number(t.target.value)||0})),className:"h-8 w-28 text-right",placeholder:"0.00"}),e.jsx("span",{className:"min-w-20 text-right",children:H>0?`-${g(H)}`:"No"})]})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-between gap-3 text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Other charges"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx($,{type:"number",min:"0",step:"0.01",value:i.otherCharges,onChange:t=>S(s=>({...s,otherCharges:Number(t.target.value)||0})),className:"h-8 w-28 text-right",placeholder:"0.00"}),e.jsx("span",{className:"min-w-20 text-right",children:K>0?`+${g(K)}`:"No"})]})]}),e.jsxs("div",{className:"mt-3 rounded-lg border bg-background p-3",children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 text-sm",children:[e.jsxs(y,{htmlFor:"pos-vat",className:"flex cursor-pointer items-center gap-2 font-normal",children:[e.jsx(Ue,{id:"pos-vat",checked:!!i.vatEnabled,onCheckedChange:t=>S(s=>({...s,vatEnabled:!!t,vatRate:s.vatRate||16}))}),"Add VAT"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx($,{type:"number",min:"0",max:"100",step:"0.01",value:i.vatRate,onChange:t=>S(s=>({...s,vatRate:Number(t.target.value)||0})),disabled:!i.vatEnabled,className:"h-8 w-20 text-right"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"%"})]})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-between text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"VAT amount"}),e.jsx("span",{children:G>0?g(G):"No"})]})]}),e.jsxs("div",{className:"mt-4 flex items-center justify-between text-lg font-display font-bold",children:[e.jsx("span",{children:"Total"}),e.jsx("span",{className:"text-primary",children:g(Ne)})]})]}),e.jsx(I,{variant:"highlight",className:"w-full",onClick:Me,disabled:!h.length||r,children:r?"Recording sale...":"Record sale and update inventory"}),e.jsx("div",{className:"text-xs text-muted-foreground",children:"Recording a POS sale deducts inventory immediately. If you later cancel the order from Orders, stock can be restored there."})]})]}),v?e.jsxs(Z,{children:[e.jsx(F,{children:e.jsx(ee,{className:"text-lg",children:"Last Sale"})}),e.jsxs(te,{className:"space-y-2 text-sm",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Order:"})," #",String(v.id).slice(0,8).toUpperCase()]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Status:"})," ",v.status]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Payment:"})," ",String(v.paymentMethod||"").replace(/_/g," ")," (",v.paymentStatus,")"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Discount:"})," ",Number(v.discountAmount||0)>0?`-${g(Number(v.discountAmount||0))}`:"No"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Other charges:"})," ",Number(v.otherCharges||0)>0?`+${g(Number(v.otherCharges||0))}`:"No"]}),v.transactionReference?e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Reference:"})," ",v.transactionReference]}):null,e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Total:"})," ",g(Number(v.totalAmount||0))]}),e.jsx(I,{asChild:!0,variant:"outline",size:"sm",children:e.jsx(De,{to:`/admin/orders/${v.id}`,children:"Open order"})})]})]}):null]})]}),e.jsx(Ze,{open:ne,onOpenChange:a,onCreated:Se}),C&&o&&e.jsx(Ye,{items:o.items,orderSummary:o.orderSummary,saleForm:o.saleForm,totalAmount:o.totalAmount,onClose:()=>{R(!1),A(null),L()}})]})};export{wt as default};
