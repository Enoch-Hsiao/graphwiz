import { db } from '../firebase/firebase';

// Universal fetch request using axios
export default function universalFetch(
    setResponse,
    endpoint,
    onError,
    onSuccess,
    once
) {
    setResponse({
        data: null,
        loading: true,
        error: null,
    });
    if(once) {
        db.ref(endpoint).once('value', (snapshot) => {
            setResponse({
                data: snapshot.val(),
                loading: false,
                error: null,
            });
            onSuccess && onSuccess(snapshot);
        }, function (error) {
            setResponse({
                data: null,
                loading: false,
                error: error,
            });
            onError && onError(error);
        });
    } else {
        db.ref(endpoint).on('value', (snapshot) => {
            setResponse({
                data: snapshot.val(),
                loading: false,
                error: null,
            });
            onSuccess && onSuccess(snapshot);
        }, function (error) {
            setResponse({
                data: null,
                loading: false,
                error: error,
            });
            onError && onError(error);
        });
    }
}
