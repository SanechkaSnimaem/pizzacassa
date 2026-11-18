const pizzas = [
  {id:1,name:"Маргарита",desc:"Томатный соус, моцарелла, базилик",price:8.90,category:"classic",image:"https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=85"},
  {id:2,name:"Пепперони",desc:"Пикантная пепперони, моцарелла, томаты",price:10.90,category:"meat",image:"https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=85"},
  {id:3,name:"Четыре сыра",desc:"Моцарелла, горгонзола, пармезан, чеддер",price:11.50,category:"classic",image:"https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=85"},
  {id:4,name:"Вегетариана",desc:"Перец, шампиньоны, маслины, руккола",price:9.90,category:"veggie",image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=85"},
  {id:5,name:"Мясной пир",desc:"Ветчина, салями, бекон, моцарелла",price:12.50,category:"meat",image:"https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=85"},
  {id:6,name:"Прошутто",desc:"Прошутто, руккола, пармезан",price:12.90,category:"meat",image:"https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=85"},
  {id:7,name:"Грибная",desc:"Шампиньоны, сливочный соус, тимьян",price:10.50,category:"veggie",image:"https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=85"},
  {id:8,name:"Дьявола",desc:"Острая салями, халапеньо, чили",price:11.90,category:"meat",image:"https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=85"}
];
let cart = [];
const grid = document.getElementById("pizzaGrid");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");

function renderMenu(filter="all") {
  grid.innerHTML = pizzas.filter(p=>filter==="all"||p.category===filter).map(p=>`
    <article class="pizza-card">
      <img src="${p.image}" alt="Пицца ${p.name}" loading="lazy">
      <h3>${p.name}</h3><p>${p.desc}</p>
      <div class="pizza-card-bottom"><b>€${p.price.toFixed(2)}</b><button class="add-button" data-add="${p.id}" aria-label="Добавить ${p.name}">+</button></div>
    </article>`).join("");
}
function renderCart() {
  const count=cart.reduce((s,i)=>s+i.qty,0);
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById("cartCount").textContent=count;
  document.getElementById("cartTotal").textContent=`€${total.toFixed(2)}`;
  document.getElementById("cartItems").innerHTML=cart.length?cart.map(i=>`
    <div class="cart-item"><div class="cart-item-info"><b>${i.name}</b><small>€${i.price.toFixed(2)} × ${i.qty}</small></div>
    <div class="quantity"><button data-change="${i.id}" data-delta="-1">−</button><b>${i.qty}</b><button data-change="${i.id}" data-delta="1">+</button></div></div>`).join(""):'<p class="empty-cart">Пока здесь пусто. Самое время выбрать пиццу 🍕</p>';
}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("open");}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("open");}
grid.addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(!btn)return;const p=pizzas.find(x=>x.id===Number(btn.dataset.add));const found=cart.find(x=>x.id===p.id);found?found.qty++:cart.push({...p,qty:1});renderCart();});
document.getElementById("cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-change]");if(!b)return;const item=cart.find(x=>x.id===Number(b.dataset.change));item.qty+=Number(b.dataset.delta);if(item.qty<=0)cart=cart.filter(x=>x.id!==item.id);renderCart();});
document.getElementById("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderMenu(b.dataset.filter);});
document.getElementById("cartButton").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
document.getElementById("menuToggle").addEventListener("click",()=>document.querySelector(".nav").classList.toggle("mobile-open"));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".nav").classList.remove("mobile-open")));

document.getElementById("orderForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const message=document.getElementById("formMessage");
  if(!cart.length){message.textContent="Добавьте хотя бы одну пиццу в заказ.";return;}
  const form=new FormData(e.currentTarget);
  const order={name:form.get("name").trim(),phone:form.get("phone").trim(),address:form.get("address").trim(),comment:form.get("comment").trim(),items:cart.map(({name,price,qty})=>({name,price,qty})),total:cart.reduce((s,i)=>s+i.price*i.qty,0)};
  const button=e.currentTarget.querySelector("button[type=submit]");
  button.disabled=true;button.textContent="Отправляем...";
  try{
    const response=await fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Не удалось отправить заказ");
    message.textContent="Заказ отправлен! Скоро мы свяжемся с вами.";
    cart=[];renderCart();e.currentTarget.reset();
  }catch(err){message.textContent=err.message==="Failed to fetch"?"Не удалось связаться с сервером. Проверьте, что сервер запущен.":err.message;}
  finally{button.disabled=false;button.innerHTML='Отправить заказ <span>↗</span>';}
});
renderMenu();renderCart();
