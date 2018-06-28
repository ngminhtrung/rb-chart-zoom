Hiện mục zoom của Rainbow (Billboard) có 4 methods sau:

1. initZoom()
2. getZoomDomain()
3. updateZoom()
4. redrawForZoom()

Với `/demo/#interaction.Zoom`:

- Chạy lần đầu tiên:

    ```
    initZoom
    getZoomDomain
    getZoomDomain
    getZoomDomain
    updateZoom
    ```
- Dùng touchpad để phóng to:

    ```
    redrawForZoom
    getZoomDomain ✖️ 2
    redrawForZoom
    getZoomDomain ✖️ 2
    ...
    updateZoom
    ```
    Pattern 1 lần `redrawForZoom`, 2 lần `getZoomDomain` lặp đi lặp lại và khi hết vuốt touchpad để zoom thì kết thúc bằng `updateZoom`.

### `initZoom` để làm gì

1. Khởi tạo tính năng zooming của d3: 
    - gán `$$.zoom = d3.zoom()`. 
    - lắng nghe event "start"
    - lắng nghe event "zoom" ➡️ gọi `redrawForZoom()`
    - lắng nghe event "end" ➡️ gọi `redrawRectEvent()` và `updateZoom()`.

2. Thêm các method cho `$$.zoom`, bao gồm:
    - `orgScaleExtent()`: trả về 2 đầu extent min và max.
    - `updateScaleExtent()`: cập nhật phần extent
    - `updateTransformScale()`

### `getZoomDomain` để làm gì

Trả về 2 giá trị `min` và `max`:
- `min` thì là giá trị nhỏ nhất giữa `$$.orgXDomain[0]` và `config.zoom_x_min`
- `max` thì là giá trị nhỏ nhất giữa `$$.orgXDomain[1]` và `config.zoom_x_max`

### `updateZoom` để làm gì

### `redrawForZoom` để làm gì

- cập nhật thanh slider
- lấy giá trị mới nhất của attribute `transform` của d3-event, sau đó truyền vào cho `$$.zoom.updateTransformScale()`.


`rescalex()`:

```javascript
ƒ (x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  }
```

## Về panning và zoom.

> Tất cả những gì cần thiết cho panning và zooming là phép dịch `translation[tx, ty]` và tỷ số scale `k`. Khi phép transform "zoom" được áp lên một element nào đó, element này đang ở vị trí `[x0, y0]`, thì vị trí mới của nó sẽ thành `[tx + k ✖️ x0, ty + k ✖️ y0]. Peter Kerpedijec trong Empty Pipes.

Khác biệt chính giữa zooming trong D3v3 và D3v4 là "behavior" (làm việc với events) và transforms (giúp điều chỉnh vị trí của element) trở nên tách biệt:
- với D3v3: behavior và transforms ở cùng 1 chỗ 
- với D3v4: 



### 3 phần cần để tâm với panning và zoomming

1. Tác động đồng bộ: panning và zoomming cùng lúc
2. Xây dựng sản phẩm
3. Áp dụng zoom và pan trong SVG và Canvas

### Thuật ngữ quan trọng

- **Zoom transform**: đây là một object khởi tạo bởi D3.js. D3.js cũng giúp ta tương tác với object này. Object chứa 3 giá trị quan trọng nhất khi làm việc với pan và zoom:
    - giá trị translation x và y
    - tỷ số scale k

    Lúc mới đầu, `transform` có giá trị là: `Transform {k: 1, x: 0, y: 0}`. Nghĩa là người dùng chưa hề zoom, hay pan phần visual. Phần scale bằng 1, translation x và y đều bằng 0.

- **Zoom behavior**: đây là hệ event giúp theo dấu vết, cũng như truyền giá trị vào transform. Nó luôn lắng nghe những thông tin truyền vào từ phía người dùng. Một khi được kích hoạt, nó sẽ gửi đi event object với thông tin về event đến handler function. Bạn sẽ viết hàm handler kia để phản ứng lại thông tin về event được gửi đến.

Phần quan trọng nhất mà zoom hanlder nhận được là giá trị của transform tại mỗi hành động zoom/ pan của người dùng. Nếu muốn làm gì với giá trị của transform, ta sẽ thực hiện trong zoom handler.

```javascript
var zoom = d3.zoom().on('zoom', zoomed);
```

- **Zoom base**: element cha mà zoom được gán vào. Nó làm 2 việc: (1) là phần bề mặt nhận biết tương tác của người dùng bằng chuột hoặc touchpad. (2) giữa object transform (x, y và k).

- **Zoom targets**: là đối tượng của zoom. 

Hơn nữa, có **hai loại zoom**: 
- **Geometric zoom** (hay *graphical zoom*): các element được phóng to/ thu nhỏ mà không có sự kahcs biệt. Tất cả các thuộc tính sẽ đều được thay đổi. Nghĩ về nó như là việc thu phóng hệ tọa độ. Mọi thứ đều được tăng giảm đồng thời không khác biệt. Geometric zoom là thứ gnaf nhất với cuộc sống. Khi chúng ta bước về phía một căn nhà, mọi chiều của căn nhà đều trở nên to ra. Tương tự, khi chúng ta phóng một trục, mọi phần của nó sẽ trở nên to ra, đường thẳng, domain path, label. Ví dụ: label có kích thước 14px sẽ được nhân gấn 2 trở thành 28px.

- **Semantic zoom** (hay *non-geometric zoom*): nghĩa là ta điều khiển từng thuộc tính đơn của phần tử trong khi zoom. Nếu ta có 1 axis, với label size là 14px, rồi zoom phần axis theo kiểu "semantic", thì ta có thể yêu cầu phần lable giữ nguyên kích thước ban đầu bất kể axis được phóng đến cấp độ nào. Các đường line có thể to ra, hoặc mỏng đi, axis sẽ được dịch chuyển đến vị trí mới dựa trên zoom, nhưng label vẫn luôn là 14px. Việc này cho phép chúng ta không chỉ kiểm soát thuộc tính của các phần tử, mà còn việc biểu diễn chúng dựa trên các cấp độ zoom. Google map là 1 ví dụ: khi mới mở Google map, chỉ có tên đất nước hiện ra, khi zoom gần hơn (tạm gọi là mức giữa), thì tên tỉnh thành, các đơn vị hành chính tiếp tục xuất hiện, zoom sâu hơn, thì tên đường phố, tên đường hiện ra.

### Zoom và pan trong 5 bước

1. Dựng phần static visual

Phải dựng cái gì đó trước tiên rồi mới có thứ để áp dụng zoom và pan được.

2. Xác định zoom base và zoom target

Lấy một mảnh giấy, liệt kê ra:
 - một element sẽ lắng nghe (chính là zoom base)
 - danh sách các element sẽ thay đổi (zoom target)

Chi tiết như sau:
- Chọn element ứng với zoom base đầu tiên. Xác định xem DOM element nào bạn muốn dùng làm zoom base. Bạn có thể gán zoom vào 1 `svg`, `g`, `rect` hay bất kỳ phần tử nào mà chuột di chuyển đến.

    Lưu ý là `g` chỉ có thể  đăng ký nhận event khi mà nó có children cùng với fill. Vì thê,s nếu bạn có 1 `g` element rất lớn, bên trong là 1 hình tròn có radius rất nhỏ (bằng 1 chẳng hạn), thì zoom gesture chỉ có thể nhận diện từ hình tròn nhỏ xíu đấy.

    Tốt nhất là set-up một SVG rectangular riêng (`rect`) với fill nhưng opacity bằng 0, và pointer-events set để đăng ký với mọi zoom. Bạn có thể phải unset pointer events cho các thành phần con.

- Xác định mọi zoom target element. 

-  Với mỗi target, xác định nếu bạn muốn sử dụng geometric hay semantic zoom. Ví dụ:

| Function | Element | Zoom type | Scale props |
|---        |---       |---     |---            |
|Zoom base  | rect#listner -rect|-  |-  |
|Zoom target | circle.planet | semantic | only circle radius |
|Zoom target | x axis tick lines | semantic | no |
|Zoom target | x axis tick lables | semantic | no |

3. Setup zoom behavior

- Tạo zoom behavior với thông số tối thiểu:

```javascript
var zoom = d3.zoom().on('zoom', zoomed);
```

Đọc them các [API của D3 cho d3.zoom()](https://github.com/d3/d3-zoom) cho các helper method như `scaleExtent`, hoặc `translateExtent`.

- Gọi zoom behavior:

```javascript
zoomBaseElement.call(zoom);
``` 

4. Viết hàm handler

Đây là nơi mà zoom và pan sẽ xảy ra. 

- Điều đầu tiên cần làm là capture (bắt) object `transform` được truyền vào handler thông quan  listener mỗi khi người dùng tương tác (thông qua chuột, touchpad):

```javascript
var transform = d3.event.transform;
```

- Nếu chỉ muốn thực hiện geometric zoom, ta chỉ cần gọi:

```javascript
zoomTargetElement
    .attr("transform", 
        "translate(" + transform.x + ", " + transform.y + ") 
            scale(" + transform.k + ")");
```

hoặc đơn giản hơn:
```javascript
zoomTargetElement.attr("transform", transform.toString());
```

- Nếu muốn thực hiện semantic zoom:

Giả sử rằng mọi dự liệu sẽ đi qua 1 scale để được translate từ data ra thành screen space, translation này thay đổi zoom.

Nếu điểm dữ liệu x = 10 được biến thành pixel space 50 trước khi zoom, zoom sẽ di nó tành một điểm khác.

Ví dụ, nếu bạn translate x 5, và scale 2, vị trí mới của x sẽ là:

x2 = x1 ✖️ k + tx
x2 = 50 x  2 + 5 = 105

May mắn là ta không phải tự thực hiện các phép toán trên, nhưng ta có thể rescale phần scale với mỗi zoom, và áp dụng vào target mà ta muốn thay đổi. Những thứ này bao gồm cả các trục X, Y, circle, hoặc rect, hoặc bất kỳ hình dạng nào mà bạn có.

Với 1 scale gọi là `xScale`, bạn có thể sử dụng hàm `.rescaleX()` và áp dụng như sau:

```javascript
var updatedScale = transform.rescaleX(xScale);
```

Bây giờ bạn có thể sử dụng `updatedScale` trong function zoom cho mọi element muốn áp dụng. Ví dụ cho trục:

```js
xAxis.scale(updatedScale); 
gAxis.call(xAxis);
```

hoặc một tập các circle:

```javascript
circles.attr("cx", function(d) { return updatedScale(d.value); })
```

5. Liệu có cần 

## Link tham khảo

- [Lars Verspohl - D3 Zoom: The Missing Manual](https://medium.freecodecamp.org/get-ready-to-zoom-and-pan-like-a-pro-after-reading-this-in-depth-tutorial-5d963b0a153e)

- [Mikael Sand - D3 zoom pan brush chart](https://github.com/msand/d3zoompanbrushchart) 

- [Empty Pipes - Panning and Zooming with D3v4](http://emptypipes.org/2016/07/03/d3-panning-and-zooming/)


### Mở đầu

Trong bài [Sử dụng D3.js để phóng to thu nhỏ SVG](https://travisnguyen.net/D3js/2018/04/23/d3js-drag-zoom-slider/), tôi đã có bước đầu tiếp cận d3-zoom ở mức độ tổng quan. Ở bài này, phần trình bày của Peter Kerpedjiev (một Postdoctoral Fellow tại Hardvard Medical School) trong [Empty Pipes - Panning and Zooming with D3v4](http://emptypipes.org/2016/07/03/d3-panning-and-zooming/) sẽ được dịch lại. Peter phân tích về d3-zoom ở mức độ chi tiết hơn, sử dụng ví dụ vừa trực quan, vừa được nâng dần độ phức tạp để người đọc kịp theo dõi. Kiến thức trình bày ở đây vừa trùng lặp, vừa nâng cao so với bài trước. Cho nên ăn may mà có thể coi đây là 2 bài trong 1 series về d3-zoom được.

Về thuật ngữ:
- **panning**: nghĩa là việc di đối tượng sang trái phải, lên trên, xuống dưới. Thường việc di này thực hiện nhờ giữ chuột trái lên vùng hiển thị, kéo qua kéo lại (đối với máy tính).
- **zooming**: là việc thu phóng đối tượng. Việc này hoặc nhờ cuộn thanh giữa của chuột, hoặc là dùng 2 ngón tay đồng thời miết trên màn hình điện thoại.
- **plot**: tạm gọi phần `svg` được tạo ra là "bản vẽ".

Để thực hiện panning và zooming thông qua D3.js, về lý thuyết, tất cả những thứ cần biết là:
- phép dịch đối tượng theo trục X và trục Y một khoảng **t<sub>x</sub>** và **t<sub>y</sub>**. Viết tiếng Anh chính là **translation [t<sub>x</sub>, t<sub>y</sub>]**.
- tỷ số thu phóng **k**. Viết tiếng Anh chính là *scale factor* **k**.
- Khi ta phóng to, thu nhỏ một đối tượng, ta đang làm biến đổi đối tượng đấy, trong D3.js gọi hành động này là một "**zoom transform**". Đại diện cho hành động này là object **transform**.
- Nếu đối tượng có vị trí ban đầu là **[x<sub>0</sub>, y<sub>0</sub>]**, thì sau khi bị biến đổi, nó có vị trí mới là **[t<sub>x</sub> + k ✖️ x<sub>0</sub>, t<sub>y</sub> + k ✖️ y<sub>0</sub>]**.
- Đơn giản vậy thôi, những thao tác còn lại chỉ là thêm mắm thêm muối cho 4 gạch đầu dòng cơ bản bên trên.

Để minh họa kỹ thuật panning và zooming trong **D3 v4**, ta sẽ lấy ví dụ vẽ 4 hình tròn tương ứng với 1 mảng của `[1, 1010, 1020, 5000]`. Tất tật chỉ cần minh họa trong 1 chiều (trục X), không cần dùng đến trục thứ 2 (gây rối mắt).

### Bước 1: Vẽ đối tượng

```javascript
    const xScale = d3.scaleLinear()
        .domain([0,5000])
        .range([100,500])

    const dataPoints = [1, 1010, 1020, 5000];

    gMain.selectAll('circle')
    .data(dataPoints)
    .enter()
    .append('circle')
    .attr('r', 7)
    .attr('cx', function(d) { return xScale(d); });
```
![Figure01](image001.png)

Nhìn vào ảnh, ta thấy 2 hình tròn ứng với 2 điểm 1010 và 1020 đang nằm đè lên nhau, lệch nhau 1 chút. Sử dụng hàm `xScale()` để tính tọa độ x của 2 điểm trên, ta nhận được kết quả bên dưới đây. Tính ra khoảng cách giữa 2 tâm của 2 đường tròn chỉ là 0.8 pixel, rất nhỏ để phân biệt được chúng.

```javascript
xScale(1010) //180.8
xScale(1020) //181.6
// 181.6 - 180.8 = 0.8
```

### Bước 2: Tăng khoảng cách giữa 2 đường tròn đang dính vào nhau 

Giả sử ta muốn 2 đường tròn kia xa nhau 10 pixels chứ không phải 0.8 pixel? Tức là phải tính một tỷ số phóng đại (scale factor) **k** bằng 12.5.

```javascript
var k = 10 / 0.8  // 12.5 
```

Giả sử thêm là sau khi phóng lên, thì đường tròn của điểm 1010 sẽ nằm tại tọa độ 200 (vẫn là trục x). Áp dụng phần cơ bản trong 4 gạch đầu dòng nói trên:
- Tọa độ ban đầu của x<sub>0</sub> của đường tròn là `xScale(10101)` bằng 180.8
- Tỷ số phóng đại k = 12.5
- Sau khi phóng, đường tròn 1010 di chuyển đến toạn độ mới bằng 200
- Phương trình cân bằng là: *200 = t<sub>x</sub> + k ✖️ x<sub>0</sub>*.
- Vậy khoảng dịch trục x (translation [tx]) sẽ là: - 2600
```javascript
var tx = 200 - k * xScale(1010) // = 200 - 12.5 * 180.8 = -2600
```

Từ đây, áp dụng vào bản vẽ ban đầu:

```javascript
var k = 10 / (xScale(1020) - xScale(1010))
var tx = 200 - k * xScale(1010)
var t = d3.zoomIdentity.translate(tx, 0).scale(k)

gMain.selectAll('circle')
.data(dataPoints)
.enter()
.append('circle')
.attr('r', 7)
.attr('cx', function(d) { return t.applyX(xScale(d)); });
```

thu được kết quả là 2 hình tròn của 1010 và 1020 đã không còn dính vào nhau nữa:

![Figure02](image002.png)

Đoạn code trên có 2 chỗ mới:
- `d3.zoomIdentity`: Đây thực chất là 1 transform có k=1, t<sub>x</sub> = t<sub>y</sub> = 0. Có thể coi là 1 transform zero, không thu phóng, không dịch chuyển. Mục đích chỉ là tạo ra object transform nguyên thủy, sau đấy bổ sung thêm *translation* mới (ứng với `translate(tx, 0)`), và thêm tỷ số thu phóng (`scale(k)`).
- `t.applyX(xScale(d))`, `t` lúc này đã là 1 object "transform" rồi, cho nên:
    - Về bản chất, công thức trên áp dụng `transform.applyX(x)` sẽ tính ra phép dịch trục X 1 khoảng là: x ✖️ k + t<sub>x</sub>
    - Ở đây, x = xScale(d), cho nên đầy đủ phép tính là: xScale(d) ✖️ k + t<sub>x</sub>.
    - Kết quả là tọa độ trục X của từng đường tròn sẽ được dịch ra 1 vị trí mới. Vị trí ban đầu là xScale(d), giờ thêm 1 quãng xScale(d) ✖️ (k - 1) + t<sub>x</sub>.

### Bước 3: Dãn trục X nằm phía trên đường tròn theo đúng tỷ lệ thu phóng vừa áp dụng

Ở trên ta đã dãn các đường tròn ra 1 đoạn, nhưng trục X nằm phía trên đường tròn (gọi là **gTopAxis**) vẫn đang bị giữ cố định (không đụng vào trục X bên dưới, nó tượng trưng cho số pixel của trục X).

Việc dãn *gTopAxis* được thực hiện thông qua việc tính lại *xScale* truyền vào cho *xTopAxis*. 

```javascript
const xNewScale = t.rescaleX(xScale)

const xTopAxis = d3.axisTop()
    .scale(xNewScale)
    .ticks(3)
```

Method `rescaleX()` của `t` (một object "transform) nhằm mục đích tạo lại scale mới dựa trên xScale (cũ) mà thôi. Method này tính toán tương đối lằng nhằng. Tạm thời chỉ cần hiểu như thế.

Kết quả ta được cả phần trục X *gTopAxis* lẫn các đường tròn được dãn đồng bộ với nhau.

![Figure03](image003.png)

### Bước 4: Tích hợp sự kiện "zoom" để người dùng sử dụng chuột/ touchpad cũng có thể thu phóng co dãn các đường tròn trên trục X

Ở các phần trên, ta hoàn toàn gán cứng việc co dãn vị trí đường tròn lẫn trục gTopAxis. Giờ nếu muốn thực hiện việc này một cách tự động, khi người dùng sử dụng chuột/ touchpad? Lúc này ta sẽ phải sử dụng sẵn "zoom behavior" mà D3.js cung cấp.

**Zoom behavior**, đây là thuật ngữ này dùng để chỉ "thứ" tạo ra bởi `d3.zoom()`, vừa là object, vừa là function:
- giúp ghi nhận mọi thao tác (cuộn chuột giữa, 2 ngón tay miết touchpad, v.v.) của người dùng (end-user) ➡️ [input event](https://github.com/d3/d3-zoom#api-reference)
- để thu phóng bản vẽ hoặc những phần có chọn lọc trong bản vẽ (chính là [selection](https://github.com/d3/d3-selection)).
- xử lý được với cả SVG, HTML hoặc Canvas
- thiết kế để tương tác với [d3-scale](https://github.com/d3/d3-scale) và [d3-axis](https://github.com/d3/d3-axis).
- có thể giới hạn tỷ số phóng đại hoặc dịch chuyển thông qua zoom.scaleExtent và zoom.translateExtent.
- có thể kết hợp với những thứ khác như [d3-drag] để kéo thả, và d3-brush.
- có thể được lập trình thông qua zoom.transform.

Ghi chú: Xem định nghĩa về **behavior** trong D3 v3 ở [đây](https://github.com/d3/d3-3.x-api-reference/blob/master/Behaviors.md). Đại loại thì **behavior** là một cách trừu tượng hóa các tương tác của người dùng thành nhưng nhóm riêng (như `drag`, `zoom`, v.v.) để lập trình viên có thể cấu hình, sử dụng nó. Để gắn *behavior* vào một phần tử (selection) nào đó, lập trình viên cần áp dụng method `call()`.

Như vậy, ta cần:
- định nghĩa "zoom behavior" thông qua `const zoom = d3.zoom()`
- thiết lập event listener cho "zoom behavior" thông qua `.on('zoom', ...);`
- thiết lập event hanlder là hàm `zoomed()` thông qua `.on('zoom', zoomed);`
- khai báo trong hàm `zoomed()` những gì ta cần xử lý. Ta sẽ nhét những gì tính toán thủ công ở các bước 2 và 3 bên trên ở bên trong `zoomed()`. Như vậy mỗi khi có event "zoom" (do người dùng tạo ra), thì event listener sẽ "nghe thấy" và gọi event hanlder là `zoomed()`, mọi tính toán liên quan đến `rescaleX()` sẽ được tự động thực hiện ngay tắp lự.

```javascript   
const circles = svg.selectAll('circle');
const zoom = d3.zoom().on('zoom', zoomed);

function zoomed() {
    var transform = d3.event.transform;

    // rescale the x linear scale so that we can draw the top axis
    var xNewScale = transform.rescaleX(xScale);
    xTopAxis.scale(xNewScale)
    gTopAxis.call(xTopAxis);

    // draw the circles in their new positions
    circles.attr('cx', function(d) { return transform.applyX(xScale(d)); });
}

gMain.call(zoom.transform, t);
gMain.call(zoom);
```

Điều cần lưu ý đoạn trên chính là:
- việc tính lại `cx` của circle được đặt trong `zoomed()`. 
- "zoom behavior" được gán vào selection "gMain" thông qua `call()`.
- `gMain.call(zoom.transform, t);` chỉ được gọi 1 lần, mục đích là thực hiện luôn bước 2 bên trên ngay khi load chương trình, giúp dãn 2 đường tròn ra không để kẹp díp. Bản chất chỗ này là việc thực hiện phép transform 1 lần và duy nhất, khác hẳn `gMain.call(zoom)` (vốn bind zoom behavior vào gMain).

Cuối cùng ta sẽ được kết quả như dưới đây. Chú ý về giá trị **t<sub>x</sub>** thay đổi không giống nhau với mỗi vị trí ban đầu của chuột.

![Figure04-01](image004_01.gif)

![Figure04-02](image004_02.gif)

### Bước 6: Khuyến mại

Tạo một đoạn script giúp tự động nhảy qua lại giữa các điểm, và tạo hiệu ứng zooming.

![Figure05](image005.gif)

```javascript
let targetPoint = 1010;

function transition(selection) {
    let n = dataPoints.length;
    let prevTargetPoint = targetPoint;

    // pick a new point to zoom to
    while (targetPoint == prevTargetPoint) {
        let i = Math.random() * n | 0
        targetPoint = dataPoints[i];
    }

    selection.transition()
    .delay(300)
    .duration(2000)
    .call(zoom.transform, transform)
    .on('end', function() { circles.call(transition); });
}

circles.call(transition);
```

Function `transition()` trên:
- chọn 1 điểm ngẫu nhiên (`targetPoint`), 
- sau đó gọi transition trên selection (là circles). 
- khi mà transition kết thúc (ứng với `.on("end", ...)`) thì gọi lại hàm `transition()`, ứng với `.on('end', function() { circles.call(transition); })`. 

Tiếp đó, ta cần làm sao để điểm targetPoint luôn ở cân giữa vùng hiển thị. Sử dụng hàm dưới đây:

```javascript
function transform() {
    // put points that are 10 values apart 20 pixels apart
    const k = 20 / (xScale(10) - xScale(0))
    // center in the middle of the visible area
    const tx = (xScale.range()[1] + xScale.range()[0])/2 - k * xScale(targetPoint)
    const t = d3.zoomIdentity.translate(tx, 0).scale(k)
    return t;
}
```

### Kết luận

- Phần d3-zoom không đơn giản tí nào. Nó tẩn mẩn, tỉ mỉ, nhiều hàm, nhiều loại object, event, event handler, event input gọi nhau chồng chéo. Bài này chỉ là bước đầu giải thích kỹ hơn so với tài liệu chính thức của D3.js về [d3-zoom](https://github.com/d3/d3-zoom#zoom_on), nhưng cũng cho thấy 1 bức tranh về cách bind cũng như gọi event.
- Việc gán zoom vào chính xác từng selection (hay là element) cho ta thấy 1 tiềm năng có thể điều khiển việc zoom theo ý muốn với từng đối tượng cụ thể, trong từng hoàn cảnh cụ thể. Đây là bài toán thực tế hơn là việc scale toàn bộ svg lên như [bài trước đây](https://travisnguyen.net/D3js/2018/04/23/d3js-drag-zoom-slider/) đã trình bày.

---

Method `d3.zoom.behavior()` tạo ra 1 function để theo dõi các tín hiệu từ:
- chuột giữa
- các hành động giữ - kéo 
- động tác vuốt - miết bằng 2 ngón trên touchpad (hoặc màn hình điện thoại) vốn được gán cho ý nghĩa "phóng to - thu nhỏ".

Một khi nó bắt được tín hiệu, hàm này sẽ chuyển những sự kiện trên thành 1 event tùy chỉnh của D3js, được gọi là "zoom event".

Mỗi zoom event sẽ đi với 2 con số: (1) scale factor, và (2) translate factor. Zoom event không làm thay đổi gì với phần `svg` của ta. Việc lập trình viên làm gì với 2 con số trên là việc của họ. 

Có 2 loại zoom:
1. **Geometric zooming**
2. **Semantic zooming**"

### Geometric zooming:
- là hiệu ứng zoom giống như những gì diễn ra ngoài đời thực, khi ta bước ta xa lại gần 1 công trình kiến trúc. Mọi thứ ở mặt tiền công trình như các hàng cột, họa tiết trang trí, đường viền, biển chữ, v.v. hoặc bé đi hoặc to ra đồng đều khi ta bước ra xa hoặc lại gần. Sẽ không có chuyện có thứ to ra có thứ bé đi, hoặc không thay đổi.

    Ví dụ dùng D3js: http://jsfiddle.net/ngminhtrung/hvLzfdaw/

- Sử dụng thuộc tính "transform", chủ yếu gán "transform" bằng `scale(x)` với `x` là tỷ số phóng đại mong muốn. Lưu ý: Việc scale gấp 2 chẳng hạn, sẽ khiến cho mọi thứ to lên gấp 2. Một pixel trở thành 2 pixels sau khi scale. Mọi thứ ở đây bao gồm:
    - hệ tọa độ
    - độ dầy của từng đường net (stroke-width)
    - font-size

    Ví dụ hình vuông có cạnh bằng 10px đang ở tọa độ (20px, 20px), scale lên 2 sẽ có cạnh 20px, vẫn tọa đọ (20px, 20px), nhưng 

<svg width="80px" height="80px" viewBox="0 0 80 80" style="background: lightyellow;" xmlns="http://www.w3.org/2000/svg">
<g id="square">
    <rect x="10" y="10" width="20" height="20" style="fill: none; stroke: black;"/>
</g>
<use xlink:href="#square" transform="scale(2)"/>
</svg>

- Nếu gán "transform" bằng `translate(tx, ty)` thì toàn bộ hệ tọa độ sẽ bị dịch theo trục x và trục y một khoảng tx và ty.

- Nếu gán "transform" bằng cả `scale(x)` lẫn `translate(tx, ty)` thì thứ tự quan trọng:
    - `translate()` trước `scale()`: phép translation (dịch) sẽ là original unit.
    - `scale()` trước `translate()`: phép translation sẽ được thực hiện trong hệ unit mới đã bị scale.

- Khi có được "zoom event", lập trình viên thường thay đổi attribute "scale" và "translate" lên đối tượng `<g>` chứa nội dung mà họ muốn thay đổi (thu phóng).


### Semantic zooming
- là hiệu ứng zoom có chọn lọc, theo ý của người lập trình. Ví dụ vẫn là mặt tiền công trình trên, người ta có thể tạo ra hiệu ứng để độ to của chữ trên biển giữ nguyên dù cho người ta có lại gần hay ra xa, hoặc khi tiến đến một khoảng cách nhất định thì một tấm biển khác lại hiện ra. Đây chính là cách mà Google map áp dụng. Ở độ zoom cấp 1, chỉ có tên nước + đường biên giới. Ở zoom cấp 2, tên thành phố của ranh giới hành chính vùng miền hiện ra. Ở zoom cấp 3, tên nước biến mất, xuất hiện thêm tên các tuyến đường, con phố, tên công trình, nhà hàng, v.v. Nếu để ý thêm, font chữ chẳng thay đổi dù ở zoom cấp nào.
- là việc zoom layout của bản vẽ mà không zoom từng thành phần con. Điều này được thực hiện thông qua việc:
    - thay đổi cách tính vị trí của các thành phần
    - độ dài của bất kỳ đường/ đoạn nào kết nối các object
    - không thay đổi hệ tọa độ cũng như độ lớn của pixel 

```javascript
zoomedPositionX = d3.event.translate[0] + d3.event.scale * dataPositionX 

zoomedPositionY = d3.event.translate[1] + d3.event.scale * dataPositionY
```

Khi làm với force layout, mọi thứ phức tạp hơn một chút bởi các object bên trong force layout graph sẽ dịch đến vị trí mới ngay sau mỗi sự kiện "tick". Để giữ cho tất cả các object đều được đưa đến đúng vị trí mới sau khi zoom, function `tick()` phải sử dụng thông tin gửi đến từ "zoom", có nghĩa là:
- "Scale" và "translation" cần phải được lưu ở một variable riêng nào đó mà function `tick()` có thể truy cập được. 
- "Scale" và "translation" phải có giá trị mặc định ban đầu (nếu không function `tick()` sẽ báo lỗi). Scale mặc định sẽ là 1, còn translation mặc định là [0, 0].

```javascript
let scaleFactor = 1;
let translation = [0,0];

function zoom() {
    scaleFactor = d3.event.scale;
    translation = d3.event.translate;
    tick(); //cập nhật vị trí các object
}
```

Hàm `zoom()` có nhiệm vụ cập nhật `scaleFactor` và `translation`, sau đó gọi `tick()`. Function `tick()` sẽ làm mọi thứ liên quan đến cập nhật vị trí của các object:
- khi khởi tạo 
- sau các event "tick" của force layout
- sau event "zoom".

```javascript
function tick() {
    linkLines.attr("x1", d =>  translation[0] + scaleFactor*d.source.x)
        .attr("y1", d => translation[1] + scaleFactor*d.source.y)
        .attr("x2", d => translation[0] + scaleFactor*d.target.x)
        .attr("y2", d => translation[1] + scaleFactor*d.target.y);

    nodeCircles.attr("cx", d => translation[0] + scaleFactor*d.x)
        .attr("cy", d => translation[1] + scaleFactor*d.y);
}
```
Vị trí của các "circle" lẫn "link" đều được hiệu chỉnh bởi translation và scale. Luôn luôn nhớ cần dùng công thức trên để chuyển đổi giữa "*tọa độ của data*" (d.x và d.y) và "*tọa độ hiển thị*" (cx, cy, x1, x2, v.v.) (liên quan trực tiếp đến vị trí của object trên viewport).

Bài toán trở nên phức tạp hơn nữa khi ta cần *tính ngược* từ "tọa độ hiển thị" sang "tọa độ của data". Ta cần làm việc này bởi một khi cho phép người dùng kéo (drag) từng node, ta phải "set" tọa độ của data dựa trên vị trí trên màn hình của node bị kéo.

Với **geometric zoom**, việc chuyển đổi giữa tọa độ trên màn hình và tọa độ data có thể làm qua `d3.mouse()`. Sử dụng `d3.mouse(container)` sẽ trả về *tọa độ tương đối* (x, y) của sự kiện hiện tại (chính là chuột) đối với container truyền vào. Container có thể là một phần tử HTML hoặc SVG (như là `<g>`). Tọa độ trả về dưới dạng một mảng `[x, y]`.

The draggable geometric-zoom force-layout looks like this:
http://jsfiddle.net/cSn6w/7/

Vậy với trường hợp này, hàm `dragged(d)` sẽ là:

```javascript
function dragged(d){
    if (d.fixed) return; //root is fixed

    //get mouse coordinates relative to the visualization "vis"
    //coordinate system:    
    var mouse = d3.mouse(vis.node());
    d.x = mouse[0]; 
    d.y = mouse[1];
    tick();//re-position this node and any links
}
```
Đối với **semantic zoom** tọa độ SVG trả veeff bởi `d3.mouse()` không còn trực tiếp liên quan đến tọa độ của data. Ta cần phải tính lại dựa trên scale và translation. Công thức sẽ thay đổi như sau:

**Công thức cũ**:

```javascript
zoomedPositionX = d3.event.translate[0] + d3.event.scale * dataPositionX 

zoomedPositionY = d3.event.translate[1] + d3.event.scale * dataPositionY
```

**Công thức mới**:
```javascript
dataPositionX = (zoomedPositionX - d3.event.translate[0]) / d3.event.scale

dataPositionY = (zoomedPositionY - d3.event.translate[1]) / d3.event.scale
```

Hàm drag mới cho *semantic zoom* là:
```javascript
function dragged(d){
    if (d.fixed) return; //root is fixed

    //get mouse coordinates relative to the visualization
    //coordinate system:
    var mouse = d3.mouse(vis.node());
    d.x = (mouse[0] - translation[0])/scaleFactor; 
    d.y = (mouse[1] - translation[1])/scaleFactor; 
    tick();//re-position this node and any links
}
```

| Features | Demo chart 1 | Demo chart 2|
|---        |---            |---           |
|Geometric zooming |
|Semantic zooming |
|Draggable geometric zooming |
|Draggable semantic zooming |
|Responsive - draggable geometric zooming |
|Responsive - draggable semantic zooming | 
