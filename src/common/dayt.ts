export function unix(){
  return Date.now();
}

export function mmddyyyy(t=Date.now()) {
  const d = new Date(t);
  const month = d.getMonth();
  const day = d.getDay();
  const year = d.getFullYear();
  const time = d.getTime()
  return `${month}-${day}-${year} at ${time}`;
}

export function parse(time) {
  return new Date(time)
		.toString()
		.split(/\s+/gim)
		.filter(x =>
			x.match(/^(\w{3}|\d{1,2}|\d{4}|(\d{2}\:\d{2}\:\d{2}))$/gim)
		);
}

export function mmm_dd_yyyy(time) {
  return new Date(time)
		.toString()
		.split(/\s+/gim)
		.slice(1, 5)
		.join(" ");
}